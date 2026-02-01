
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider, AppInitializer, useLanguage } from '@/contexts/LanguageContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { UIProvider, useUI } from '@/contexts/UIContext';
import { TaskProvider, useTask } from '@/contexts/TaskContext';
import { useEffect, useState } from 'react';
import * as React from 'react';
import LoadingAnimation from '@/components/ui/loading-animation';
import { User2, Settings2, PlusCircle, ListTodo, FileText, ChevronRight, LogOut, AlignLeft, AlignRight, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { usePathname, useRouter } from 'next/navigation';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileDrawer } from '@/components/mobile/MobileDrawer';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

function ProfileSection() {
    const { t } = useLanguage();
    const { currentUser, userProfile, handleUserInitiatedLogout } = useAuth();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // If not logged in, show login button
    if (!currentUser || !userProfile) {
        return (
            <Link href="/auth">
                <button className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                    <User2 className="h-6 w-6" />
                </button>
            </Link>
        );
    }

    // If logged in, show profile dropdown
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(userProfile as any).profilePictureUrl ? (
                            <img
                                src={(userProfile as any).profilePictureUrl}
                                alt={userProfile.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            getInitials(userProfile.name || 'U')
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-right overflow-hidden">
                        <p className="text-sm font-semibold text-foreground truncate">
                            {userProfile.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {userProfile.companyName}
                        </p>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-right">
                    <div>
                        <p className="font-semibold">{userProfile.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">{currentUser.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <Link href="/profile" passHref>
                    <DropdownMenuItem>
                        <User2 className="ml-2 h-4 w-4" />
                        <span>{t('myProfile')}</span>
                    </DropdownMenuItem>
                </Link>

                <Link href="/settings?tab=account" passHref>
                    <DropdownMenuItem>
                        <Settings2 className="ml-2 h-4 w-4" />
                        <span>{t('accountSettings')}</span>
                    </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleUserInitiatedLogout}
                    className="text-destructive focus:text-destructive"
                >
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function RootLayoutContent({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage();
    const { backgroundUrl, viewMode } = useUI(); // Updated from useLanguage
    const { currentUser, userProfile, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

    const [isClient, setIsClient] = useState(false);
    const redirectAttemptedRef = React.useRef(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            document.documentElement.style.setProperty('--app-background-image', `url(${backgroundUrl})`);
        }
    }, [backgroundUrl]);

    // Redirect unauthenticated users to auth page (but only once per session)
    useEffect(() => {
        if (!isClient || isLoading) return;

        const shouldRedirect = !currentUser && pathname !== '/auth';

        if (shouldRedirect && !redirectAttemptedRef.current) {
            redirectAttemptedRef.current = true;
            router.push('/auth');
        } else if (currentUser) {
            // Reset redirect flag when user is authenticated
            redirectAttemptedRef.current = false;
        }
    }, [isClient, isLoading, currentUser, pathname, router]);

    if (!isClient) {
        return <div className="h-screen w-screen" />;
    }

    // If on auth page, render without layout
    if (pathname === '/auth') {
        return <>{children}</>;
    }

    // Show loading while checking auth
    if (isLoading) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    // If no user, show loading (redirect will happen via useEffect)
    if (!currentUser) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    // Check if email is verified - redirect to auth page if not
    if (currentUser && userProfile && !userProfile.emailVerified) {
        // If already on auth page, don't redirect (user might be verifying)
        if (pathname === '/auth') {
            return <>{children}</>;
        }
        // Otherwise redirect to auth page for verification
        if (pathname !== '/auth') {
            router.replace('/auth');
        }
        return <LoadingAnimation text={t('loadingData')} />;
    }

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/archives', label: t('archives') },
        { href: '/data-analysis', label: t('dataAnalysis') },
        { href: '/mutual', label: t('mutualItems') },
    ];

    const handleAddClick = () => {
        router.push('/add');
    };

    // Mobile Layout
    if (viewMode === 'mobile') {
        return (
            <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
                <MobileHeader
                    onMenuClick={() => setIsDrawerOpen(true)}
                    onActionClick={handleAddClick}
                />
                <MobileDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                />
                <main className="flex-1 overflow-y-auto w-full pb-4 scroll-smooth">
                    {children}
                </main>
                <MobileBottomNav />
                <EditDialog />
            </div>
        );
    }

    // Desktop Layout
    return (
        <div className="flex h-screen bg-muted/20">
            <aside className="w-40 flex-shrink-0 flex flex-col items-center gap-y-6 py-5 bg-card border-r">
                {/* Split Add button */}
                <div className="w-full px-4 flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="default"
                                className="w-full h-16 btn-gradient rounded-lg text-lg font-bold flex items-center justify-center gap-2"
                            >
                                {t('newItem')} <PlusCircle className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="center">
                            <DropdownMenuLabel>{t('newItem')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/add?tab=task" passHref>
                                <DropdownMenuItem>
                                    <ListTodo className="mr-2 h-4 w-4" />
                                    <span>{t('tasksTab')}</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/add?tab=letter" passHref>
                                <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>{t('lettersTab')}</span>
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col items-center gap-y-2 flex-grow w-full px-4">
                    {navLinks.map(link => {
                        const isActive = (pathname === '/' && link.href === '/') || (link.href !== '/' && pathname.startsWith(link.href));
                        return (
                            <Link key={link.href} href={link.href} className="w-full">
                                <div className={cn(
                                    "flex items-center justify-center p-2 rounded-lg cursor-pointer transition-colors w-full h-12",
                                    isActive ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted/50 text-muted-foreground hover:text-card-foreground"
                                )}>
                                    <span className="text-sm font-semibold">{link.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Profile Section - Bottom Left Corner */}
                <div className="w-full flex justify-center pb-4">
                    <ProfileSection />
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

            <EditDialog />
        </div>
    );
}

const EditDialog = () => {
    const { t } = useLanguage();
    const {
        isEditingField,
        editingFieldValue,
        setEditingFieldValue,
        editingFieldConfig,
        setEditingFieldConfig,
        isAiSuggesting,
        stopEditing,
    } = useUI();
    const { handleAiSuggest, handleSaveField } = useTask();

    if (!isEditingField) return null;

    const allFonts = [
        // Kurdish/Arabic Fonts
        { name: 'Speda', value: 'Speda, sans-serif' },
        { name: 'Noto Sans Arabic', value: '"Noto Sans Arabic", sans-serif' },
        { name: 'Cairo', value: 'Cairo, sans-serif' },
        { name: 'Tajawal', value: 'Tajawal, sans-serif' },
        { name: 'Almarai', value: 'Almarai, sans-serif' },
        // English/General Fonts
        { name: 'Roboto', value: 'Roboto, sans-serif' },
        { name: 'Open Sans', value: '"Open Sans", sans-serif' },
        { name: 'Lato', value: 'Lato, sans-serif' },
        { name: 'Montserrat', value: 'Montserrat, sans-serif' },
        // System UI Fonts
        { name: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' },
        { name: 'Serif', value: 'serif' },
        { name: 'Sans-Serif', value: 'sans-serif' },
        { name: 'Monospace', value: 'monospace' },
    ];


    return (
        <Dialog open={!!isEditingField} onOpenChange={(open) => !open && stopEditing()}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditingField?.field === 'name' && t(isEditingField?.item && 'taskNumber' in isEditingField.item ? 'taskNameLabel' : 'letterNameLabel')}
                        {isEditingField?.field === 'detail' && t(isEditingField?.item && 'taskNumber' in isEditingField.item ? 'taskDetailLabel' : 'letterDetailLabel')}
                        {isEditingField?.field === 'furtherDetails' && t('furtherDetailsValueLabel')}
                        {isEditingField?.field === 'result' && t('resultIfDoneLabel')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditingField?.item.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <div className="flex items-center gap-2 p-1 rounded-md border bg-muted flex-row-reverse">
                        <TooltipProvider>
                            <Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setEditingFieldConfig(c => ({ ...c, direction: 'ltr' }))}><AlignLeft className="h-4 w-4" /></Button>
                            </TooltipTrigger><TooltipContent><p>LTR</p></TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setEditingFieldConfig(c => ({ ...c, direction: 'rtl' }))}><AlignRight className="h-4 w-4" /></Button>
                            </TooltipTrigger><TooltipContent><p>RTL</p></TooltipContent></Tooltip>
                            <Select value={editingFieldConfig?.fontSize} onValueChange={(val) => setEditingFieldConfig(c => ({ ...c, fontSize: val }))}>
                                <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.75rem">{t('fontSmall')}</SelectItem>
                                    <SelectItem value="0.875rem">{t('fontNormal')}</SelectItem>
                                    <SelectItem value="1rem">{t('fontMedium')}</SelectItem>
                                    <SelectItem value="1.125rem">{t('fontLarge')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={editingFieldConfig?.fontFamily} onValueChange={(val) => setEditingFieldConfig(c => ({ ...c, fontFamily: val }))}>
                                <SelectTrigger className="w-32 h-8"><SelectValue placeholder={t('fontSelect')} /></SelectTrigger>
                                <SelectContent>
                                    {allFonts.map(font => (
                                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TooltipProvider>
                        {isEditingField?.field === 'furtherDetails' && isEditingField.item && 'taskNumber' in isEditingField.item && (
                            <Button onClick={handleAiSuggest} disabled={isAiSuggesting} variant="ghost" size="icon" className="mr-auto">
                                {isAiSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>
                    <div className="glass-card rounded-md p-1">
                        <Textarea
                            value={editingFieldValue}
                            onChange={(e) => setEditingFieldValue(e.target.value)}
                            className="h-48 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                            style={{ direction: editingFieldConfig?.direction, fontSize: editingFieldConfig?.fontSize, fontFamily: editingFieldConfig?.fontFamily }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => stopEditing()}>{t('cancel')}</Button>
                    <Button onClick={() => {
                        if (isEditingField) {
                            handleSaveField(isEditingField.item.id, isEditingField.field, editingFieldValue, 'taskNumber' in isEditingField.item ? 'task' : 'letter', editingFieldConfig);
                            stopEditing();
                        }
                    }}>{t('saveChanges')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LanguageProvider>
            <AuthProvider>
                <UIProvider>
                    <TaskProvider>
                        <AppInitializer>
                            <RootLayoutContent>
                                {children}
                            </RootLayoutContent>
                            <Toaster />
                            {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
                        </AppInitializer>
                    </TaskProvider>
                </UIProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}
