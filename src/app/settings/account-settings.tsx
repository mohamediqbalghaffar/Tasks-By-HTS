'use client';

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Shield, Key, Mail, Trash2, Share2, UserCog, Edit, Save, X as XIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ShareCodeEditor = ({ userProfile, updateShareCode, t }: any) => {
    const [code, setCode] = React.useState(userProfile?.shareCode?.toString() || '');
    const [isEditing, setIsEditing] = React.useState(false);

    React.useEffect(() => {
        if (userProfile?.shareCode) setCode(userProfile.shareCode.toString());
    }, [userProfile]);

    const handleSave = async () => {
        const num = parseInt(code);
        if (!isNaN(num)) {
            await updateShareCode(num);
            setIsEditing(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Input
                type="number"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={!isEditing}
                className="font-mono font-bold text-center text-lg h-12"
            />
            {isEditing ? (
                <>
                    <Button onClick={handleSave} size="icon" className="shrink-0 h-12 w-12"><Save className="h-5 w-5" /></Button>
                    <Button variant="ghost" onClick={() => { setIsEditing(false); setCode(userProfile?.shareCode?.toString() || ''); }} size="icon" className="shrink-0 h-12 w-12"><XIcon className="h-5 w-5" /></Button>
                </>
            ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} size="icon" className="shrink-0 h-12 w-12"><Edit className="h-5 w-5" /></Button>
            )}
        </div>
    );
};

export function AccountSettings() {
    const { t, language } = useLanguage();
    const {
        currentUser,
        userProfile,
        handleDeleteAccount,
        handlePasswordReset,
        updateShareCode
    } = useAuth();

    const isRtl = language === 'ku';

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
            {!currentUser ? (
                <div className="text-center p-10">
                    <h3 className="text-lg font-semibold">{t('loginRequired')}</h3>
                    <Button className="mt-4" onClick={() => window.location.href = '/auth'}>{t('logIn')}</Button>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <Share2 className="h-5 w-5" />
                            {t('shareCode')}
                        </h2>
                        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-base">{t('shareCode')}</CardTitle>
                                <CardDescription>{t('shareCodeDesc') || 'Your unique code for sharing items'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ShareCodeEditor userProfile={userProfile} updateShareCode={updateShareCode} t={t} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <Shield className="h-5 w-5" />
                            {t('securitySettings')}
                        </h2>
                        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
                            <div className="h-2 bg-gradient-to-l from-blue-500 to-purple-600"></div>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Key className="h-4 w-4 text-primary" />
                                    {t('passwordSettings')}
                                </CardTitle>
                                <CardDescription>{t('managePasswordDesc') || 'Change your password via email link'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={() => handlePasswordReset(currentUser.email!)}
                                    variant="outline"
                                    className="w-full justify-between group hover:border-primary/50"
                                >
                                    <span className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        {t('sendResetLink')}
                                    </span>
                                    <Key className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            {t('dangerZone')}
                        </h2>
                        <Card className="border-destructive/20 shadow-md bg-destructive/5 backdrop-blur-sm overflow-hidden">
                            <div className="h-2 bg-destructive/20"></div>
                            <CardHeader>
                                <CardTitle className="text-base text-destructive flex items-center gap-2">
                                    <UserCog className="h-4 w-4" />
                                    {t('deleteAccountButton')}
                                </CardTitle>
                                <CardDescription>{t('deleteAccountWarning')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full justify-between group">
                                            <span>{t('deleteAccountButton')}</span>
                                            <Trash2 className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="border-destructive/20" dir={isRtl ? 'rtl' : 'ltr'}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-destructive flex items-center gap-2">
                                                <Shield className="h-5 w-5" />
                                                {t('confirmDelete')}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="bg-destructive/10 p-3 rounded-lg text-destructive font-medium mt-2">
                                                {t('deleteAccountWarning')}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-2">
                                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteAccount}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                {t('deleteAccountButton')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
