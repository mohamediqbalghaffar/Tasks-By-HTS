'use client';

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Palette, UserCog, Shield } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import LoadingAnimation from '@/components/ui/loading-animation';

import { GeneralSettings } from './general-settings';
import { AccountSettings } from './account-settings';
import { AdminSettings } from './admin-settings';

export default function SettingsPage() {
    const { t, language } = useLanguage();
    const { currentUser, userProfile } = useAuth(); // Use useAuth instead of useData

    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') === 'account' ? 'account' : 'general';

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    return (
        <div className="p-4 h-full flex flex-col pb-28 md:pb-4" dir={language === 'ku' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{t('appSettings')}</h1>
                {currentUser && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        {currentUser.email}
                    </div>
                )}
            </div>

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className={`grid w-full ${userProfile?.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'} mb-6`}>
                    <TabsTrigger value="general" className="gap-2">
                        <Palette className="h-4 w-4" />
                        {t('generalSettings')}
                    </TabsTrigger>
                    <TabsTrigger value="account" className="gap-2">
                        <UserCog className="h-4 w-4" />
                        {t('accountSettings')}
                    </TabsTrigger>
                    {userProfile?.role === 'admin' && (
                        <TabsTrigger value="admin" className="gap-2">
                            <Shield className="h-4 w-4" />
                            {t('adminSettings')}
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="general" className="focus-visible:outline-none focus-visible:ring-0">
                    <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
                        <GeneralSettings />
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="account" className="focus-visible:outline-none focus-visible:ring-0">
                    <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
                        <AccountSettings />
                    </ScrollArea>
                </TabsContent>

                {userProfile?.role === 'admin' && (
                    <TabsContent value="admin" className="focus-visible:outline-none focus-visible:ring-0">
                        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
                            <AdminSettings />
                        </ScrollArea>
                    </TabsContent>
                )}
            </Tabs>
        </div >
    );
}
