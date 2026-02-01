'use client';

import * as React from 'react';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';

interface MobileHeaderProps {
    onMenuClick: () => void;
    onActionClick?: () => void;
}

export function MobileHeader({ onMenuClick, onActionClick }: MobileHeaderProps) {
    const { t } = useLanguage();
    const pathname = usePathname();

    // Determine page title based on route
    const getPageTitle = () => {
        if (pathname === '/') return t('home');
        if (pathname.startsWith('/archives')) return t('archives');
        if (pathname.startsWith('/data-analysis')) return t('dataAnalysis');
        if (pathname.startsWith('/mutual')) return t('mutualItems');
        if (pathname.startsWith('/settings')) return t('settings');
        if (pathname.startsWith('/add')) return t('newItem');
        if (pathname.startsWith('/profile')) return t('myProfile');
        return t('home');
    };

    // Show action button only on certain pages
    const showActionButton = pathname === '/' || pathname.startsWith('/archives');

    return (
        <header className="h-14 bg-card border-b flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm shrink-0">
            <button
                onClick={onMenuClick}
                className="h-10 w-10 flex items-center justify-center -ml-2 rounded-full active:bg-muted transition-colors text-foreground"
                aria-label="Menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            <h1 className="text-lg font-semibold text-foreground absolute left-1/2 -translate-x-1/2 truncate max-w-[50%] text-center">
                {getPageTitle()}
            </h1>

            {showActionButton && onActionClick ? (
                <button
                    onClick={onActionClick}
                    className="h-9 px-3 bg-primary text-primary-foreground rounded-full flex items-center gap-1.5 text-sm font-medium shadow-sm active:scale-95 transition-all"
                    aria-label={t('newItem')}
                >
                    <Plus className="h-4 w-4" />
                    <span>{t('newItem')}</span>
                </button>
            ) : (
                <div className="w-10" />
            )}
        </header>
    );
}
