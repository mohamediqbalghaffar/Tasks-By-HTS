'use client';

import * as React from 'react';
import { X, Home, Archive, BarChart3, Users, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
    const { t } = useLanguage();
    const { currentUser, userProfile, handleUserInitiatedLogout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const navLinks = [
        { href: '/', label: t('home'), icon: Home },
        { href: '/archives', label: t('archives'), icon: Archive },
        { href: '/data-analysis', label: t('dataAnalysis'), icon: BarChart3 },
    ];

    const handleLogout = async () => {
        await handleUserInitiatedLogout();
        onClose();
        router.push('/auth');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200]">
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={cn(
                "fixed top-0 bottom-0 z-[201] w-[280px] max-w-[85vw] bg-card flex flex-col shadow-xl transition-transform duration-300 ease-out",
                // LTR
                "ltr:left-0 ltr:-translate-x-full",
                isOpen && "ltr:translate-x-0",
                // RTL
                "rtl:right-0 rtl:translate-x-full",
                isOpen && "rtl:translate-x-0"
            )}>
                {/* Header with close button */}
                <div className="p-4 border-b flex justify-end">
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-full active:bg-muted transition-colors text-foreground"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Profile Section */}
                {currentUser && userProfile && (
                    <div className="p-4 flex items-center gap-3 border-b bg-muted/30">
                        <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shrink-0">
                            {getInitials(userProfile.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-foreground truncate">{userProfile.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{currentUser.email}</p>
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navLinks.map(link => {
                        const Icon = link.icon;
                        const isActive = (pathname === '/' && link.href === '/') ||
                            (link.href !== '/' && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="truncate">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t space-y-1">
                    <Link
                        href="/settings"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                        <span>{t('settings')}</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
