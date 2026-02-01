'use client';

import * as React from 'react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Mail, Lock, User, Building, Briefcase, Eye, EyeOff, ArrowLeft, Send, LogIn, UserPlus, CheckCircle2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_COMPANIES, DEFAULT_OFFICES, DEFAULT_POSITIONS, isHTSCompany } from '@/lib/constants';

export default function AuthPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const { currentUser, handleLogin, handleSignup, handlePasswordReset, handleVerifyCode, handleResendVerificationCode, handleResendVerificationByEmail, handleUserInitiatedLogout } = useAuth();
    const { toast } = useToast();

    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [position, setPosition] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');
    const [adminCode, setAdminCode] = useState('');
    const [office, setOffice] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Track if we've already attempted a redirect to prevent loops
    const hasRedirectedRef = React.useRef(false);
    const { userProfile } = useAuth();

    // Only redirect if user is logged in AND email is verified AND not showing verification screen
    React.useEffect(() => {
        // If user is logged in but not verified, show verification screen
        if (currentUser && userProfile && !userProfile.emailVerified) {
            setVerificationSent(true);
            setVerificationEmail(userProfile.email); // Ensure we have the email to show
        }

        // Don't redirect if we're showing the verification screen
        if (verificationSent) {
            return;
        }

        if (currentUser && userProfile?.emailVerified && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push('/');
        } else if (!currentUser || !userProfile?.emailVerified) {
            // Reset the redirect flag when user logs out or is unverified
            hasRedirectedRef.current = false;
        }
    }, [currentUser, userProfile, router, verificationSent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await handleLogin(email, password);
                router.push('/');
            } else if (mode === 'signup') {
                if (role === 'admin' && adminCode !== '99@@') {
                    toast({
                        title: t('error'),
                        description: t('adminCodeInvalid') || 'Invalid admin code',
                        variant: 'destructive',
                    });
                    return;
                }
                await handleSignup(email, password, name, company, position, role, office);
                setVerificationSent(true);
                setVerificationEmail(email);
            } else if (mode === 'reset') {
                await handlePasswordReset(email);
                setMode('login');
            }
        } catch (error) {
            console.error('Auth error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isRtl = language === 'ku';

    const handleVerifySubmit = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            return;
        }

        setIsVerifying(true);
        try {
            await handleVerifyCode(verificationCode);
            // On success, redirect to home
            router.push('/');
        } catch (error) {
            console.error('Verification error:', error);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        try {
            await handleResendVerificationCode();
            setVerificationCode(''); // Clear the input
        } catch (error) {
            console.error('Resend error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (verificationSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4" dir={isRtl ? 'rtl' : 'ltr'}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 shadow-2xl border-white/20">
                        <CardHeader className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-6 ring-4 ring-blue-50 dark:ring-blue-900/30"
                            >
                                <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{t('verifyYourEmail')}</CardTitle>
                            <CardDescription className="text-base mt-2">
                                {t('verificationCodeSentTo') || 'Verification code sent to'} <span className="font-bold text-foreground block mt-1 bg-muted px-2 py-1 rounded">{verificationEmail}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
                                <Send className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                    {t('enterCodeBelow') || 'Enter the 6-digit code sent to your email to verify your account.'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="verification-code">{t('verificationCode') || 'Verification Code'}</Label>
                                <Input
                                    id="verification-code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="text-center text-2xl font-mono tracking-widest"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && verificationCode.length === 6) {
                                            handleVerifySubmit();
                                        }
                                    }}
                                />
                            </div>

                            <Button
                                onClick={handleVerifySubmit}
                                disabled={isVerifying || verificationCode.length !== 6}
                                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                {t('verifyEmail') || 'Verify Email'}
                            </Button>

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-3">{t('didntReceiveCode') || "Didn't receive the code?"}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-primary/5"
                                    onClick={handleResendCode}
                                    disabled={isLoading}
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('resendCode') || 'Resend Code'}
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="ghost"
                                className="w-full hover:bg-muted"
                                onClick={async () => {
                                    await handleUserInitiatedLogout();
                                    setVerificationSent(false);
                                    setMode('login');
                                    setVerificationCode('');
                                }}
                            >
                                <ArrowLeft className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                {t('backToLogin')}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div >
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4" dir={isRtl ? 'rtl' : 'ltr'}>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md"
                >
                    <Card className="items-center backdrop-blur-3xl bg-white/70 dark:bg-slate-900/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border-white/40 dark:border-white/5 relative overflow-hidden">
                        {/* Decorative gradient blob */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                        <CardHeader className="text-center pb-2">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="mx-auto w-12 h-12 bg-gradient-to-tr from-primary to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20"
                            >
                                {mode === 'login' && <LogIn className="h-6 w-6 text-white" />}
                                {mode === 'signup' && <UserPlus className="h-6 w-6 text-white" />}
                                {mode === 'reset' && <Lock className="h-6 w-6 text-white" />}
                            </motion.div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                {mode === 'login' ? t('logIn') : mode === 'signup' ? t('signUp') : t('resetPassword')}
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                {mode === 'login' ? t('signInToAccount') : mode === 'signup' ? t('createAccount') : t('sendResetLink')}
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-4">
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="name">{t('fullName')}</Label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder={t('enterName')}
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className={`pl-10 transition-all border-muted group-hover:border-primary/50 focus:border-primary ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('role')}</Label>
                                            <RadioGroup value={role} onValueChange={(value) => setRole(value as 'admin' | 'user')} className="flex gap-4">
                                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                    <RadioGroupItem value="user" id="user" />
                                                    <Label htmlFor="user" className="cursor-pointer font-normal">{t('user')}</Label>
                                                </div>
                                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                    <RadioGroupItem value="admin" id="admin" />
                                                    <Label htmlFor="admin" className="cursor-pointer font-normal">
                                                        <Shield className="inline h-4 w-4 mr-1" />
                                                        {t('admin')}
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {role === 'admin' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="adminCode">{t('adminCode')}</Label>
                                                <div className="relative group">
                                                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="adminCode"
                                                        type="password"
                                                        placeholder={t('enterAdminCode')}
                                                        value={adminCode}
                                                        onChange={(e) => setAdminCode(e.target.value)}
                                                        className={`pl-10 transition-all border-muted group-hover:border-primary/50 focus:border-primary ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="company">{t('companyName')}</Label>
                                            <Select value={company} onValueChange={setCompany} dir={isRtl ? 'rtl' : 'ltr'} required>
                                                <SelectTrigger id="company" className={`${isRtl ? 'text-right' : 'text-left'}`}>
                                                    <SelectValue placeholder={t('selectCompany')}>
                                                        {company ? t(DEFAULT_COMPANIES.find(c => c.id === company)?.label || '') : t('selectCompany')}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DEFAULT_COMPANIES.map((comp) => (
                                                        <SelectItem key={comp.id} value={comp.id}>{t(comp.label)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {isHTSCompany(company) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-2"
                                            >
                                                <Label htmlFor="office">{t('office')}</Label>
                                                <Select value={office} onValueChange={setOffice} dir={isRtl ? 'rtl' : 'ltr'} required>
                                                    <SelectTrigger id="office" className={`${isRtl ? 'text-right' : 'text-left'}`}>
                                                        <SelectValue placeholder={t('selectOffice')}>
                                                            {office ? t(DEFAULT_OFFICES.find(o => o.id === office)?.label || '') : t('selectOffice')}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DEFAULT_OFFICES.map((off) => (
                                                            <SelectItem key={off.id} value={off.id}>{t(off.label)}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </motion.div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="position">{t('position')}</Label>
                                            <Select value={position} onValueChange={setPosition} dir={isRtl ? 'rtl' : 'ltr'} required>
                                                <SelectTrigger id="position" className={`${isRtl ? 'text-right' : 'text-left'}`}>
                                                    <SelectValue placeholder={t('selectPosition')}>
                                                        {position ? t(DEFAULT_POSITIONS.find(p => p.id === position)?.label || '') : t('selectPosition')}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DEFAULT_POSITIONS.map((pos) => (
                                                        <SelectItem key={pos.id} value={pos.id}>{t(pos.label)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('emailAddress')}</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={t('enterEmail')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`pl-10 transition-all border-muted group-hover:border-primary/50 focus:border-primary bg-background/50 ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                {mode === 'signup' && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                                            {t('alreadySignedUp') || "Already signed up but didn't receive the code?"}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full h-8 text-xs"
                                            onClick={async () => {
                                                if (!email) {
                                                    toast({
                                                        title: t('error'),
                                                        description: t('enterEmailFirst') || 'Please enter your email address first',
                                                        variant: 'destructive'
                                                    });
                                                    return;
                                                }
                                                try {
                                                    await handleResendVerificationByEmail(email);
                                                    setVerificationSent(true);
                                                    setVerificationEmail(email);
                                                } catch (error) {
                                                    // Error already handled in the function
                                                }
                                            }}
                                            disabled={isLoading || !email}
                                        >
                                            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                            <Send className="mr-2 h-3 w-3" />
                                            {t('resendVerificationEmail') || 'Resend Verification Email'}
                                        </Button>
                                    </div>
                                )}

                                {mode !== 'reset' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="password">{t('password')}</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder={t('enterPassword')}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`transition-all border-muted group-hover:border-primary/50 focus:border-primary bg-background/50 ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`absolute top-3 text-muted-foreground hover:text-foreground transition-colors ${isRtl ? 'left-3' : 'right-3'}`}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {mode === 'login' && (
                                    <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            className="px-0 text-xs text-primary/80 hover:text-primary"
                                            onClick={() => setMode('reset')}
                                        >
                                            {t('forgotPassword')}
                                        </Button>
                                    </div>
                                )}

                                {mode === 'login' && (
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                                            {t('emailNotVerified') || "Email not verified?"}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={async () => {
                                                if (!email) {
                                                    toast({
                                                        title: t('error'),
                                                        description: t('enterEmailFirst') || 'Please enter your email address first',
                                                        variant: 'destructive'
                                                    });
                                                    return;
                                                }
                                                try {
                                                    await handleResendVerificationByEmail(email);
                                                    setVerificationSent(true);
                                                    setVerificationEmail(email);
                                                } catch (error) {
                                                    // Error already handled in the function
                                                }
                                            }}
                                            disabled={isLoading || !email}
                                        >
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Send className="mr-2 h-4 w-4" />
                                            {t('resendVerificationEmail') || 'Resend Verification Email'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4 pb-8">
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {mode === 'login' ? t('logIn') : mode === 'signup' ? t('signUp') : t('sendResetLink')}
                                </Button>

                                {mode === 'reset' ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full text-muted-foreground hover:text-foreground"
                                        onClick={() => setMode('login')}
                                    >
                                        <ArrowLeft className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                        {t('backToLogin')}
                                    </Button>
                                ) : (
                                    <div className="text-center text-sm pt-2">
                                        <span className="text-muted-foreground block mb-1.5">
                                            {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/5"
                                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                        >
                                            {mode === 'login' ? t('signUp') : t('logIn')}
                                        </Button>
                                    </div>
                                )}
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
