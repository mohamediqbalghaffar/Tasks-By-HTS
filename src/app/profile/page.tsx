'use client';

import * as React from 'react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Building, Briefcase, Mail, Calendar, Shield, Camera, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import LoadingAnimation from '@/components/ui/loading-animation';

export default function ProfilePage() {
    const { t } = useLanguage();
    const { currentUser, userProfile, handleProfilePictureChange, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userProfile?.name || '');
    const [company, setCompany] = useState(userProfile?.companyName || '');
    const [position, setPosition] = useState(userProfile?.position || '');

    // Redirect if not logged in
    React.useEffect(() => {
        if (!isLoading && !currentUser) {
            router.push('/auth');
        }
    }, [currentUser, router, isLoading]);

    if (isLoading) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    if (!currentUser || !userProfile) {
        return null;
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSave = async () => {
        try {
            // TODO: Implement profile update in context
            toast({
                title: t('success'),
                description: t('profileUpdated'),
            });
            setIsEditing(false);
        } catch (error) {
            toast({
                title: t('error'),
                description: t('profileUpdateFailed'),
                variant: 'destructive',
            });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // handleProfilePictureChange expects the event
        await handleProfilePictureChange(e);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{t('myProfile')}</h1>
                        <p className="text-muted-foreground">{t('viewEditProfile')}</p>
                    </div>
                </div>

                {/* Profile Card */}
                <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-2">
                        <div className="relative inline-block">
                            <Avatar className="w-32 h-32 mx-auto border-4 border-primary/20">
                                <AvatarImage src={(userProfile as any).profilePictureUrl} />
                                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    {getInitials(userProfile.name)}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="profile-picture"
                                className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                            >
                                <Camera className="h-4 w-4" />
                                <input
                                    id="profile-picture"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                        <CardTitle className="text-2xl mt-4">{userProfile.name}</CardTitle>
                        <CardDescription>{userProfile.position}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        <Separator />

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                {t('accountInformation')}
                            </h3>

                            <div className="grid gap-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {t('fullName')}
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="text-right"
                                        />
                                    ) : (
                                        <p className="text-lg font-medium p-3 bg-muted/50 rounded-lg">{userProfile.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {t('emailAddress')}
                                    </Label>
                                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                        <p className="text-lg font-medium flex-1">{currentUser.email}</p>
                                        {currentUser.emailVerified && (
                                            <Shield className="h-5 w-5 text-green-500" aria-label={t('verified')} />
                                        )}
                                    </div>
                                </div>

                                {/* Company */}
                                <div className="space-y-2">
                                    <Label htmlFor="company" className="flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        {t('companyName')}
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="company"
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            className="text-right"
                                        />
                                    ) : (
                                        <p className="text-lg font-medium p-3 bg-muted/50 rounded-lg">{userProfile.companyName}</p>
                                    )}
                                </div>

                                {/* Position */}
                                <div className="space-y-2">
                                    <Label htmlFor="position" className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        {t('position')}
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="position"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            className="text-right"
                                        />
                                    ) : (
                                        <p className="text-lg font-medium p-3 bg-muted/50 rounded-lg">{userProfile.position}</p>
                                    )}
                                </div>

                                {/* Account Created */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {t('accountCreated')}
                                    </Label>
                                    <p className="text-lg font-medium p-3 bg-muted/50 rounded-lg">
                                        {userProfile.createdAt ? format(new Date(userProfile.createdAt.seconds * 1000), 'PPP') : t('unknown')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <Button onClick={handleSave} className="flex-1">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('saveChanges')}
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                                        {t('cancel')}
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)} className="w-full">
                                    {t('editProfile')}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
