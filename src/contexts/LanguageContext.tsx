'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, type Locale } from '@/lib/translations';
import { enUS as enUSLocale, arSA, type Locale as DateFnsLocale } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import LoadingAnimation from '@/components/ui/loading-animation';

interface LanguageContextType {
    language: Locale;
    setLanguage: (language: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    getDateFnsLocale: () => DateFnsLocale;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_LANGUAGE = 'taskmaster_language_v1';

// --- Custom Kurdish Locale for date-fns ---
const kuLocale: DateFnsLocale = {
    code: 'ku',
    formatDistance: (token, count, options) => {
        options = options || {}
        const withSuffix = options.addSuffix === true
        const isFuture = options.comparison && options.comparison > 0

        const format = (unit: { one: string, other: string }, isFuture: boolean) => {
            const form = count === 1 ? unit.one : unit.other
            if (withSuffix) {
                if (isFuture) {
                    return `لە ماوەی ${count} ${form}دا`
                } else {
                    return `نزیکەی ${count} ${form} لەمەوپێش`
                }
            }
            return `${count} ${form}`
        }

        const formatSimple = (past: string, future: string) => {
            if (withSuffix) {
                return !!isFuture ? future : past
            }
            return past // Fallback for no suffix
        }

        switch (token) {
            case 'lessThanXSeconds':
                return formatSimple('کەمتر لە چرکەیەک لەمەوپێش', 'لە ماوەی کەمتر لە چرکەیەکدا')
            case 'xSeconds':
                return format({ one: 'چرکە', other: 'چرکە' }, !!isFuture)
            case 'halfAMinute':
                return formatSimple('نیو خولەک لەمەوپێش', 'لە ماوەی نیو خولەکدا')
            case 'lessThanXMinutes':
                return formatSimple('کەمتر لە خولەکێک لەمەوپێش', 'لە ماوەی کەمتر لە خولەکێکدا')
            case 'xMinutes':
                return format({ one: 'خولەک', other: 'خولەک' }, !!isFuture)
            case 'aboutXHours':
                return format({ one: 'کاتژمێر', other: 'کاتژمێر' }, !!isFuture)
            case 'xHours':
                return format({ one: 'کاتژمێر', other: 'کاتژمێر' }, !!isFuture)
            case 'xDays':
                return format({ one: 'ڕۆژ', other: 'ڕۆژ' }, !!isFuture)
            case 'aboutXWeeks':
                return format({ one: 'هەفتە', other: 'هەفتە' }, !!isFuture)
            case 'xWeeks':
                return format({ one: 'هەفتە', other: 'هەفتە' }, !!isFuture)
            case 'aboutXMonths':
                return format({ one: 'مانگ', other: 'مانگ' }, !!isFuture)
            case 'xMonths':
                return format({ one: 'مانگ', other: 'مانگ' }, !!isFuture)
            case 'aboutXYears':
                return format({ one: 'ساڵ', other: 'ساڵ' }, !!isFuture)
            case 'xYears':
                return format({ one: 'ساڵ', other: 'ساڵ' }, !!isFuture)
            case 'overXYears':
                return format({ one: 'ساڵ', other: 'ساڵ' }, !!isFuture)
            case 'almostXYears':
                return format({ one: 'ساڵ', other: 'ساڵ' }, !!isFuture)
            default:
                return ''
        }
    },
    formatLong: {
        date: () => 'yyyy/MM/dd',
        time: () => 'HH:mm:ss',
        dateTime: () => 'yyyy/MM/dd HH:mm:ss',
    },
    formatRelative: () => '',
    localize: {
        ordinalNumber: (n: number) => String(n),
        month: (n: number) => ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمموز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'][n],
    } as any,
    match: {} as any,
}
// --- End Custom Locale ---

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Locale>('ku');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedLang = localStorage.getItem(LOCAL_STORAGE_KEY_LANGUAGE) as Locale | null;
        if (storedLang && ['ku'].includes(storedLang)) {
            setLanguageState(storedLang);
        } else {
            setLanguageState('ku'); // Default to Kurdish
        }
    }, []);

    const setLanguage = useCallback((newLocale: Locale) => {
        setLanguageState(newLocale);
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY_LANGUAGE, newLocale);
            document.documentElement.lang = newLocale;
            document.documentElement.dir = (newLocale === 'ku') ? 'rtl' : 'ltr';
        }
    }, []);

    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        let translation = translations[language]?.[key] || translations['ku']?.[key] || key;
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                translation = translation.replace(`{${paramKey}}`, String(paramValue));
            });
        }
        return translation;
    }, [language]);

    const getDateFnsLocale = useCallback(() => {
        switch (language) {
            case 'ku':
                return kuLocale;
            default:
                return enUSLocale;
        }
    }, [language]);

    if (!isMounted) {
        return null; // Or a loading spinner if preferred, but usually context providers shouldn't render UI
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, getDateFnsLocale }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const AppInitializer = ({ children }: { children: ReactNode }) => {
    const { language, t } = useLanguage();
    const { isLoading: isAuthLoading } = useAuth();
    const { isInitialDataLoading, isMounted } = useTask();

    useEffect(() => {
        if (isMounted) {
            document.documentElement.lang = language;
            document.documentElement.dir = (language === 'ku') ? 'rtl' : 'ltr';
            document.title = t('pageTitle') || 'Tasks (by HTS)';
        }
    }, [language, t, isMounted]);

    if (isAuthLoading) {
        return <LoadingAnimation text={t('loadingAuth')} />;
    }

    if (isInitialDataLoading) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    return <>{children}</>;
};

export type {
    Task,
    ApprovalLetter,
    FieldConfig,
    Priority,
    AIChatMessage,
    SavedChat,
    ReceivedItem
} from './TaskContext';

export type { StoredUser } from './AuthContext'; 
