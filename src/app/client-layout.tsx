
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
import { User2, Settings2, PlusCircle, ListTodo, FileText, ChevronRight, LogOut, AlignLeft, AlignRight, Brain, Loader2, BarChart3, Archive, LayoutDashboard, GitMerge } from 'lucide-react';
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
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white hover:scale-105 transition-all shadow-lg">
                    <User2 className="h-5 w-5" />
                </button>
            </Link>
        );
    }

    // If logged in, show profile dropdown
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors group">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md">
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
                        <p className="text-xs font-semibold text-white truncate">
                            {userProfile.name}
                        </p>
                        <p className="text-[10px] text-white/50 truncate">
                            {userProfile.companyName}
                        </p>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-3 w-3 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" />
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
        { href: '/', label: t('home'), icon: LayoutDashboard },
        { href: '/archives', label: t('archives'), icon: Archive },
        { href: '/data-analysis', label: t('dataAnalysis'), icon: BarChart3 },
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
        <div className="flex h-screen" style={{ background: 'linear-gradient(135deg, #f0f2f8 0%, #e8eaf6 50%, #f3e8ff 100%)' }}>
            {/* Sidebar */}
            <aside
                className="w-48 flex-shrink-0 flex flex-col items-center py-5 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(180deg, #1a1040 0%, #2d1b69 35%, #0f2454 70%, #0a1628 100%)',
                    boxShadow: '4px 0 32px rgba(0,0,0,0.3)',
                }}
            >
                {/* Decorative glow orb */}
                <div className="absolute top-0 left-0 w-full h-48 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, #7c3aed 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 100% 100%, #06b6d4 0%, transparent 70%)' }} />

                {/* Brand Logo */}
                <div className="w-full px-4 mb-6 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 4px 20px rgba(124,58,237,0.5)' }}>
                        T
                    </div>
                    <span className="text-white/60 text-[10px] font-medium tracking-widest uppercase">by HTS</span>
                </div>

                {/* New Item Button */}
                <div className="w-full px-3 mb-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="w-full h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border-0 text-white shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}
                            >
                                <PlusCircle className="h-4 w-4" /> {t('newItem')}
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
                <nav className="flex flex-col items-center gap-y-1 flex-grow w-full px-3">
                    {navLinks.map(link => {
                        const isActive = (pathname === '/' && link.href === '/') || (link.href !== '/' && pathname.startsWith(link.href));
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href} className="w-full">
                                <div className={cn(
                                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 w-full group",
                                    isActive
                                        ? "text-white shadow-lg"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/10"
                                )}
                                    style={isActive ? {
                                        background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(6,182,212,0.4))',
                                        boxShadow: '0 2px 16px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                                    } : {}}>
                                    <Icon className={cn("h-4 w-4 shrink-0 transition-all", isActive ? "text-cyan-300" : "group-hover:text-white/70")} />
                                    <span className="text-xs font-semibold truncate">{link.label}</span>
                                    {isActive && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div className="w-full px-4 mb-3">
                    <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)' }} />
                </div>

                {/* Profile Section */}
                <div className="w-full px-3">
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
                        {isEditingField?.field === 'letterType' && t('letterTypeLabel')}
                        {isEditingField?.field === 'sentTo' && t('sentToLabel')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditingField?.item.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <div className="flex items-center gap-2 p-1 rounded-md border bg-muted flex-row-reverse">
                        <TooltipProvider>
                            {/* Hide formatting options for select fields */}
                            {!['letterType', 'sentTo'].includes(isEditingField?.field as string) && (
                                <>
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
                                </>
                            )}
                        </TooltipProvider>
                        {isEditingField?.field === 'furtherDetails' && isEditingField.item && 'taskNumber' in isEditingField.item && (
                            <Button onClick={handleAiSuggest} disabled={isAiSuggesting} variant="ghost" size="icon" className="mr-auto">
                                {isAiSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>
                    <div className="glass-card rounded-md p-1">
                        {/* Render different inputs based on field type */}
                        {isEditingField?.field === 'letterType' ? (
                            <Select value={editingFieldValue} onValueChange={setEditingFieldValue}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('selectLetterType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {['letterType_general', 'letterType_termination', 'letterType_service_extension', 'letterType_candidacy', 'letterType_position_change', 'letterType_commencement', 'letterType_confirmation', 'letterType_leave', 'letterType_material_request', 'letterType_material_return'].map(opt => (
                                        <SelectItem key={opt} value={opt}>{t(opt)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : isEditingField?.field === 'sentTo' ? (
                            <Select value={editingFieldValue} onValueChange={setEditingFieldValue}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('selectDepartment')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {['sentTo_chairman', 'sentTo_ceo', 'sentTo_hr', 'sentTo_accounting', 'sentTo_supply_chain', 'sentTo_equipment', 'sentTo_office_slemani', 'sentTo_office_kirkuk', 'sentTo_office_diyala'].map(opt => (
                                        <SelectItem key={opt} value={opt}>{t(opt)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Textarea
                                value={editingFieldValue}
                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                className="h-48 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                style={{ direction: editingFieldConfig?.direction, fontSize: editingFieldConfig?.fontSize, fontFamily: editingFieldConfig?.fontFamily }}
                            />
                        )}

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

import { InstallPrompt } from '@/components/InstallPrompt';

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
                            <InstallPrompt />
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
