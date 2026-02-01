'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import {
    onAuthStateChanged,
    type User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    deleteUser,
    sendPasswordResetEmail
} from 'firebase/auth';
import {
    doc,
    onSnapshot,
    setDoc,
    serverTimestamp,
    deleteDoc,
    updateDoc,
    runTransaction,
    query,
    collection,
    where,
    getDocs,
    getDoc,
    type Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateVerificationCode, sendVerificationCodeEmail } from '@/lib/email';

export interface StoredUser {
    uid: string;
    name: string;
    companyName: string;
    position: string;
    email: string;
    createdAt?: Timestamp;
    shareCode?: number;
    photoURL?: string;
    emailVerified?: boolean;
    role?: 'admin' | 'user';
    office?: string;
}

export interface VerificationCode {
    userId: string;
    code: string;
    email: string;
    createdAt: Timestamp;
    expiresAt: Timestamp;
    verified: boolean;
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: StoredUser | null;
    isLoading: boolean;
    handleLogin: (email: string, pass: string) => Promise<void>;
    handleSignup: (email: string, pass: string, name: string, company: string, position: string, role?: 'admin' | 'user', office?: string) => Promise<void>;
    handleVerifyCode: (code: string) => Promise<void>;
    handleResendVerificationCode: () => Promise<void>;
    handleResendVerificationByEmail: (email: string) => Promise<void>;
    handlePasswordReset: (email: string) => Promise<void>;
    handleUserInitiatedLogout: () => Promise<void>;
    handleDeleteAccount: () => Promise<void>;
    handleProfilePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    updateShareCode: (newCode: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getNextShareCode = async (db: any): Promise<number> => {
    const counterRef = doc(db, 'counters', 'users');
    return runTransaction(db, async (transaction: any) => {
        const counterDoc = await transaction.get(counterRef);
        let newCode = 1;
        if (counterDoc.exists()) {
            const data = counterDoc.data();
            newCode = (data.lastShareCode || 0) + 1;
        }
        transaction.set(counterRef, { lastShareCode: newCode }, { merge: true });
        return newCode;
    });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<StoredUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        if (!auth) {
            setIsLoading(false);
            return;
        }

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            // If internal loading needs to be handled differently, adjust here.
            // But we also need to wait for profile.
            if (!user) setIsLoading(false);
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!currentUser || !db) {
            setUserProfile(null);
            return;
        }

        const uid = currentUser.uid;
        const unsubProfile = onSnapshot(doc(db, 'users', uid),
            (snap) => {
                setUserProfile(snap.exists() ? { uid, ...snap.data() } as StoredUser : null);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching user profile:", error);
                setIsLoading(false);
            }
        );

        return () => unsubProfile();
    }, [currentUser]);

    const handleLogin = useCallback(async (email: string, password: string): Promise<void> => {
        if (!auth || !db) throw new Error('Firebase not initialized');

        try {
            setIsLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check email verification status from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();

            if (!userData?.emailVerified) {
                toast({
                    title: t('emailNotVerified'),
                    description: t('pleaseVerifyEmail'),
                    variant: 'destructive'
                });
                await signOut(auth);
                throw new Error('Email not verified');
            }

            toast({ title: t('loginSuccess'), description: t('welcomeBack') });
        } catch (error: any) {
            console.error('Login error:', error);
            let errorMessage = t('loginFailed');
            if (error.code === 'auth/user-not-found') errorMessage = t('userNotFound');
            else if (error.code === 'auth/invalid-credential') errorMessage = t('invalidCredentials') || 'Invalid email or password. Please check your credentials and try again.';
            else if (error.code === 'auth/wrong-password') errorMessage = t('wrongPassword');
            else if (error.code === 'auth/invalid-email') errorMessage = t('invalidEmail');
            else if (error.message === 'Email not verified') errorMessage = t('pleaseVerifyEmail');

            toast({ title: t('error'), description: errorMessage, variant: 'destructive' });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [t, toast]);

    const handleSignup = useCallback(async (
        email: string,
        password: string,
        name: string,
        company: string,
        position: string,
        role: 'admin' | 'user' = 'user',
        office?: string
    ): Promise<void> => {
        if (!auth || !db) throw new Error('Firebase not initialized');

        try {
            setIsLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Generate verification code
            const verificationCode = generateVerificationCode();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Code expires in 15 minutes

            // Store verification code in Firestore
            await setDoc(doc(db, 'verificationCodes', user.uid), {
                userId: user.uid,
                code: verificationCode,
                email,
                createdAt: serverTimestamp(),
                expiresAt: expiresAt,
                verified: false
            });

            // Create user profile
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name,
                companyName: company,
                position,
                email,
                createdAt: serverTimestamp(),
                emailVerified: false,
                shareCode: await getNextShareCode(db),
                role: role || 'user',
                ...(office && { office })
            });

            // Send verification code email
            await sendVerificationCodeEmail(email, name, verificationCode);

            toast({
                title: t('signupSuccess'),
                description: t('verificationCodeSent') || 'Verification code sent to your email'
            });

            // Keep user signed in but unverified
        } catch (error: any) {
            console.error('Signup error:', error);
            let errorMessage = t('signupFailed');
            if (error.code === 'auth/email-already-in-use') errorMessage = t('emailAlreadyInUse');
            else if (error.code === 'auth/weak-password') errorMessage = t('weakPassword');
            else if (error.code === 'auth/invalid-email') errorMessage = t('invalidEmail');

            toast({ title: t('error'), description: errorMessage, variant: 'destructive' });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [t, toast]);

    const handleVerifyCode = useCallback(async (code: string): Promise<void> => {
        if (!auth || !db || !currentUser) throw new Error('Not authenticated or Firebase not initialized');

        try {
            setIsLoading(true);

            // Get verification code document
            const codeDoc = await getDoc(doc(db, 'verificationCodes', currentUser.uid));

            if (!codeDoc.exists()) {
                throw new Error('No verification code found');
            }

            const codeData = codeDoc.data() as VerificationCode;

            // Check if code has already been verified
            if (codeData.verified) {
                throw new Error('Code already used');
            }

            // Check if code has expired
            const now = new Date();
            const expiresAt = codeData.expiresAt instanceof Date
                ? codeData.expiresAt
                : codeData.expiresAt.toDate();

            if (now > expiresAt) {
                throw new Error('Code expired');
            }

            // Verify the code
            if (codeData.code !== code.trim()) {
                throw new Error('Invalid code');
            }

            // Mark code as verified
            await updateDoc(doc(db, 'verificationCodes', currentUser.uid), {
                verified: true
            });

            // Update user profile to mark email as verified
            await updateDoc(doc(db, 'users', currentUser.uid), {
                emailVerified: true
            });

            toast({
                title: t('verificationSuccess') || 'Email Verified!',
                description: t('emailVerifiedSuccess') || 'Your email has been successfully verified.'
            });
        } catch (error: any) {
            console.error('Verification error:', error);
            let errorMessage = t('verificationFailed') || 'Verification failed';

            if (error.message === 'Invalid code') {
                errorMessage = t('invalidVerificationCode') || 'Invalid verification code';
            } else if (error.message === 'Code expired') {
                errorMessage = t('codeExpired') || 'Verification code has expired. Please request a new one.';
            } else if (error.message === 'Code already used') {
                errorMessage = t('codeAlreadyUsed') || 'This code has already been used';
            } else if (error.message === 'No verification code found') {
                errorMessage = t('noCodeFound') || 'No verification code found. Please sign up again.';
            }

            toast({ title: t('error'), description: errorMessage, variant: 'destructive' });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, t, toast]);

    const handleResendVerificationCode = useCallback(async (): Promise<void> => {
        if (!auth || !db || !currentUser) throw new Error('Not authenticated or Firebase not initialized');

        try {
            setIsLoading(true);

            // Get user profile to get name and email
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (!userDoc.exists()) {
                throw new Error('User profile not found');
            }

            const userData = userDoc.data() as StoredUser;

            // Generate new verification code
            const verificationCode = generateVerificationCode();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);

            // Update verification code in Firestore
            await setDoc(doc(db, 'verificationCodes', currentUser.uid), {
                userId: currentUser.uid,
                code: verificationCode,
                email: userData.email,
                createdAt: serverTimestamp(),
                expiresAt: expiresAt,
                verified: false
            });

            // Send new verification code email
            await sendVerificationCodeEmail(userData.email, userData.name, verificationCode);

            toast({
                title: t('codeSent') || 'Code Sent',
                description: t('newCodeSent') || 'A new verification code has been sent to your email.'
            });
        } catch (error: any) {
            console.error('Resend code error:', error);
            toast({
                title: t('error'),
                description: t('resendFailed') || 'Failed to resend verification code',
                variant: 'destructive'
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, t, toast]);

    const handleResendVerificationByEmail = useCallback(async (email: string): Promise<void> => {
        if (!auth || !db) throw new Error('Firebase not initialized');

        try {
            setIsLoading(true);

            // Find user by email
            const usersQuery = query(collection(db, 'users'), where('email', '==', email));
            const usersSnapshot = await getDocs(usersQuery);

            if (usersSnapshot.empty) {
                throw new Error('User not found');
            }

            const userDoc = usersSnapshot.docs[0];
            const userData = userDoc.data() as StoredUser;

            // Check if email is already verified
            if (userData.emailVerified) {
                toast({
                    title: t('emailAlreadyVerified') || 'Email Already Verified',
                    description: t('emailAlreadyVerifiedDesc') || 'Your email is already verified. You can log in now.',
                });
                return;
            }

            // Generate new verification code
            const verificationCode = generateVerificationCode();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);

            // Update verification code in Firestore
            await setDoc(doc(db, 'verificationCodes', userDoc.id), {
                userId: userDoc.id,
                code: verificationCode,
                email: userData.email,
                createdAt: serverTimestamp(),
                expiresAt: expiresAt,
                verified: false
            });

            // Send verification email
            await sendVerificationCodeEmail(userData.email, userData.name, verificationCode);

            toast({
                title: t('codeSent') || 'Code Sent',
                description: t('newCodeSent') || 'A new verification code has been sent to your email.'
            });
        } catch (error: any) {
            console.error('Resend verification error:', error);
            let errorMessage = t('resendFailed') || 'Failed to resend verification code';

            if (error.message === 'User not found') {
                errorMessage = t('userNotFound') || 'No account found with this email';
            }

            toast({
                title: t('error'),
                description: errorMessage,
                variant: 'destructive'
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [t, toast]);


    const handlePasswordReset = useCallback(async (email: string): Promise<void> => {
        if (!auth) throw new Error('Firebase not initialized');
        try {
            await sendPasswordResetEmail(auth, email);
            toast({ title: t('passwordResetSent'), description: t('checkYourEmail') });
        } catch (error: any) {
            console.error('Password reset error:', error);
            let errorMessage = t('passwordResetFailed');
            if (error.code === 'auth/user-not-found') errorMessage = t('userNotFound');
            else if (error.code === 'auth/invalid-email') errorMessage = t('invalidEmail');

            toast({ title: t('error'), description: errorMessage, variant: 'destructive' });
            throw error;
        }
    }, [t, toast]);

    const handleUserInitiatedLogout = useCallback(async () => {
        try {
            setIsLoading(true);
            if (auth) await signOut(auth);
            toast({ title: t('logoutSuccess') || "Logged out successfully" });
            router.push('/auth');
        } catch (error: any) {
            console.error("Logout error:", error);
            toast({ title: t('logoutFailed') || "Logout failed", description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [t, router, toast]);

    const handleDeleteAccount = useCallback(async () => {
        if (!currentUser || !db) return;
        try {
            setIsLoading(true);
            await deleteDoc(doc(db, 'users', currentUser.uid));
            await deleteUser(currentUser);
            toast({ title: t('accountDeleted') || "Account deleted" });
        } catch (error: any) {
            console.error("Delete account error:", error);
            toast({ title: t('errorDeletingAccount') || "Error deleting account", description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, t, toast]);

    const handleProfilePictureChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser || !storage || !db) return;
        try {
            const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            await updateDoc(doc(db, 'users', currentUser.uid), {
                profilePictureUrl: url
            });
            toast({ title: t('profilePictureUpdated') || "Profile picture updated" });
        } catch (error: any) {
            console.error("Profile picture error:", error);
            toast({ title: t('errorUpdatingProfilePicture'), variant: 'destructive' });
        }
    }, [currentUser, t, toast]);

    const updateShareCode = useCallback(async (newCode: number) => {
        if (!currentUser || !db) return;

        if (typeof newCode !== 'number' || newCode < 1) throw new Error('Invalid code');

        const q = query(collection(db, 'users'), where('shareCode', '==', newCode));
        const snapshot = await getDocs(q);
        if (!snapshot.empty && snapshot.docs[0].id !== currentUser.uid) {
            throw new Error(t('codeAlreadyTaken') || 'Code already taken');
        }

        await updateDoc(doc(db, 'users', currentUser.uid), { shareCode: newCode });
        toast({ title: t('profileUpdated') });
    }, [currentUser, t, toast]);

    return (
        <AuthContext.Provider value={{
            currentUser,
            userProfile,
            isLoading,
            handleLogin,
            handleSignup,
            handleVerifyCode,
            handleResendVerificationCode,
            handleResendVerificationByEmail,
            handlePasswordReset,
            handleUserInitiatedLogout,
            handleDeleteAccount,
            handleProfilePictureChange,
            updateShareCode
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};
