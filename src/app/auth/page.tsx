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
    const { currentUser, handleLogin, handleSignup, handlePasswordReset, handleUserInitiatedLogout } = useAuth();
    const { toast } = useToast();

    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [position, setPosition] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');
    const [adminCode, setAdminCode] = useState('');
    const [signupCode, setSignupCode] = useState(''); // New passcode field
    const [office, setOffice] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Track if we've already attempted a redirect to prevent loops
    const hasRedirectedRef = React.useRef(false);
    const { userProfile } = useAuth();

    // Redirect logged-in users to home
    React.useEffect(() => {
        if (currentUser && userProfile && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push('/');
        } else if (!currentUser || !userProfile) {
            hasRedirectedRef.current = false;
        }
    }, [currentUser, userProfile, router]);

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

                // Verify signup code
                if (signupCode !== '99@@') {
                    toast({
                        title: t('error'),
                        description: t('invalidSignUpCode') || 'Invalid sign-up code. Please enter the correct code to create an account.',
                        variant: 'destructive',
                    });
                    return;
                }

                await handleSignup(email, password, name, company, position, role, office);
                // Account created and verified, redirect handled by useEffect or explicit push if needed
                router.push('/');
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

                                {mode === 'signup' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="signupCode">{t('signUpCode') || 'Sign-Up Code'}</Label>
                                        <div className="relative group">
                                            <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="signupCode"
                                                type="password"
                                                placeholder={t('enterSignUpCode') || 'Enter sign-up code'}
                                                value={signupCode}
                                                onChange={(e) => setSignupCode(e.target.value)}
                                                className={`pl-10 transition-all border-muted group-hover:border-primary/50 focus:border-primary ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                                                required
                                            />
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
