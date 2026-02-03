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

interface AuthContextType {
    currentUser: User | null;
    userProfile: StoredUser | null;
    isLoading: boolean;
    handleLogin: (email: string, pass: string) => Promise<void>;
    handleSignup: (email: string, pass: string, name: string, company: string, position: string, role?: 'admin' | 'user', office?: string) => Promise<void>;
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
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: t('loginSuccess'), description: t('welcomeBack') });
        } catch (error: any) {
            console.error('Login error:', error);
            let errorMessage = t('loginFailed');
            if (error.code === 'auth/user-not-found') errorMessage = t('userNotFound');
            else if (error.code === 'auth/invalid-credential') errorMessage = t('invalidCredentials') || 'Invalid email or password. Please check your credentials and try again.';
            else if (error.code === 'auth/wrong-password') errorMessage = t('wrongPassword');
            else if (error.code === 'auth/invalid-email') errorMessage = t('invalidEmail');

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

            // Create user profile with email already verified
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name,
                companyName: company,
                position,
                email,
                createdAt: serverTimestamp(),
                emailVerified: true, // Mark as verified immediately
                shareCode: await getNextShareCode(db),
                role: role || 'user',
                ...(office && { office })
            });

            toast({
                title: t('signupSuccess'),
                description: t('accountCreated') || 'Account created successfully! You can now log in.'
            });

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
