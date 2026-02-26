'use client';

import * as React from 'react';
import { Home, Archive, BarChart3, Users, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
    const { t } = useLanguage();
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: t('home'), icon: Home },
        { href: '/archives', label: t('archives'), icon: Archive },
        { href: '/data-analysis', label: t('dataAnalysis'), icon: BarChart3 },
        { href: '/settings', label: t('settings'), icon: Settings },
    ];

    return (
        <nav className="shrink-0 w-full h-safe-bottom-nav bg-background/80 backdrop-blur-xl border-t border-border/50 flex justify-around items-start pt-2 z-40 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            {navItems.map(item => {
                const Icon = item.icon;
                const isActive = (pathname === '/' && item.href === '/') ||
                    (item.href !== '/' && pathname.startsWith(item.href));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] text-[11px] rounded-xl transition-all duration-300 relative",
                            isActive
                                ? "text-primary font-bold active-nav-item"
                                : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/30"
                        )}
                    >
                        {isActive && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-b-full shadow-[0_2px_8px_hsl(var(--primary)_/_0.6)]" />
                        )}
                        <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} />
                        <span className={cn("max-w-full truncate px-1 transition-opacity", isActive ? "opacity-100" : "opacity-80")}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
