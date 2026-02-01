'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Task, ApprovalLetter, FieldConfig } from '@/contexts/LanguageContext'; // We'll move these types later

const LOCAL_STORAGE_KEY_UI_FONT = 'taskmaster_ui_font_v1';
const LOCAL_STORAGE_KEY_THEME = 'taskmaster_theme_v1';
const LOCAL_STORAGE_KEY_VIEW_MODE = 'taskmaster_view_mode_v1';
const DEFAULT_BACKGROUND_URL = 'https://picsum.photos/seed/dark-abstract/1920/1080';

export type Theme = 'light' | 'dark' | 'system';
export type ViewMode = 'desktop' | 'mobile';

interface UIContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    uiFont: string;
    setUiFont: (font: string) => void;
    backgroundUrl: string;
    setBackgroundUrl: (url: string) => void;
    showTasks: boolean;
    setShowTasks: React.Dispatch<React.SetStateAction<boolean>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    filterStatus: string[];
    setFilterStatus: React.Dispatch<React.SetStateAction<string[]>>;
    filterLetterTypes: string[];
    setFilterLetterTypes: React.Dispatch<React.SetStateAction<string[]>>;
    filterDepartments: string[];
    setFilterDepartments: React.Dispatch<React.SetStateAction<string[]>>;
    filterPriorities: number[];
    setFilterPriorities: React.Dispatch<React.SetStateAction<number[]>>;
    filterDatePreset: string;
    setFilterDatePreset: React.Dispatch<React.SetStateAction<string>>;
    filterCustomDateFrom: Date | undefined;
    setFilterCustomDateFrom: React.Dispatch<React.SetStateAction<Date | undefined>>;
    filterCustomDateTo: Date | undefined;
    setFilterCustomDateTo: React.Dispatch<React.SetStateAction<Date | undefined>>;
    sortOption: string;
    setSortOption: React.Dispatch<React.SetStateAction<string>>;
    isEditingField: { item: Task | ApprovalLetter; field: keyof (Task & ApprovalLetter) } | null;
    editingFieldValue: string;
    editingFieldConfig: FieldConfig;
    isAiSuggesting: boolean;
    setEditingFieldValue: React.Dispatch<React.SetStateAction<string>>;
    setEditingFieldConfig: React.Dispatch<React.SetStateAction<FieldConfig>>;
    handleOpenEditField: (item: Task | ApprovalLetter, field: keyof (Task & ApprovalLetter)) => void;
    stopEditing: () => void;
    resetFilters: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('system');
    const [viewMode, setViewModeState] = useState<ViewMode>('desktop');
    const [uiFont, setUiFontState] = useState<string>('Noto Sans Arabic, sans-serif');
    const [backgroundUrl, setBackgroundUrlState] = useState<string>(DEFAULT_BACKGROUND_URL);
    const [isMounted, setIsMounted] = useState(false);

    // Filter states
    const [showTasks, setShowTasks] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string[]>(['active', 'expired']);
    const [filterLetterTypes, setFilterLetterTypes] = useState<string[]>([]);
    const [filterDepartments, setFilterDepartments] = useState<string[]>([]);
    const [filterPriorities, setFilterPriorities] = useState<number[]>([]);
    const [filterDatePreset, setFilterDatePreset] = useState<string>('all');
    const [filterCustomDateFrom, setFilterCustomDateFrom] = useState<Date | undefined>();
    const [filterCustomDateTo, setFilterCustomDateTo] = useState<Date | undefined>();
    const [sortOption, setSortOption] = useState<string>('createdAt_desc');

    // Edit state
    const [isEditingField, setIsEditingField] = useState<{ item: Task | ApprovalLetter, field: keyof (Task & ApprovalLetter) } | null>(null);
    const [editingFieldValue, setEditingFieldValue] = useState('');
    const [editingFieldConfig, setEditingFieldConfig] = useState<FieldConfig>({ direction: 'rtl', fontSize: '0.875rem' });
    const [isAiSuggesting, setIsAiSuggesting] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedUiFont = localStorage.getItem(LOCAL_STORAGE_KEY_UI_FONT);
        if (storedUiFont) setUiFontState(storedUiFont);

        const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as Theme | null;
        if (storedTheme) setThemeState(storedTheme);

        // View Mode: Check localStorage first, then auto-detect on first visit
        const storedViewMode = localStorage.getItem(LOCAL_STORAGE_KEY_VIEW_MODE) as ViewMode | null;
        if (storedViewMode) {
            setViewModeState(storedViewMode);
        } else {
            // Auto-detect based on screen width (only on first visit)
            const isMobileWidth = window.innerWidth < 768;
            const detectedMode: ViewMode = isMobileWidth ? 'mobile' : 'desktop';
            setViewModeState(detectedMode);
            localStorage.setItem(LOCAL_STORAGE_KEY_VIEW_MODE, detectedMode);
        }
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY_THEME, newTheme);
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            if (newTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(newTheme);
            }
        }
    }, []);

    const setViewMode = useCallback((newMode: ViewMode) => {
        setViewModeState(newMode);
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY_VIEW_MODE, newMode);
            const root = window.document.documentElement;
            root.setAttribute('data-view', newMode);
        }
    }, []);

    const setUiFont = useCallback((newFont: string) => {
        setUiFontState(newFont);
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY_UI_FONT, newFont);
            document.body.style.fontFamily = newFont;
        }
    }, []);

    const setBackgroundUrl = useCallback((newUrl: string) => {
        setBackgroundUrlState(newUrl);
    }, []);

    useEffect(() => {
        if (isMounted) {
            document.body.style.fontFamily = uiFont;
        }
    }, [uiFont, isMounted]);

    useEffect(() => {
        if (isMounted) {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(theme);
            }
        }
    }, [theme, isMounted]);

    useEffect(() => {
        if (isMounted) {
            const root = window.document.documentElement;
            root.setAttribute('data-view', viewMode);
        }
    }, [viewMode, isMounted]);

    const handleOpenEditField = useCallback((item: Task | ApprovalLetter, field: keyof (Task & ApprovalLetter)) => {
        setIsEditingField({ item, field });
        setEditingFieldValue((item as any)[field] || '');
        const configField = `${String(field)}Config` as keyof typeof item;
        setEditingFieldConfig((item as any)[configField] || { direction: 'rtl', fontSize: '0.875rem' });
    }, []);

    const stopEditing = useCallback(() => {
        setIsEditingField(null);
    }, []);

    const resetFilters = useCallback(() => {
        setSearchQuery('');
        setFilterStatus(['active', 'expired']);
        setFilterLetterTypes([]);
        setFilterDepartments([]);
        setFilterPriorities([]);
        setFilterDatePreset('all');
        setFilterCustomDateFrom(undefined);
        setFilterCustomDateTo(undefined);
        setSortOption('createdAt_desc');
    }, []);

    return (
        <UIContext.Provider value={{
            theme, setTheme,
            viewMode, setViewMode,
            uiFont, setUiFont,
            backgroundUrl, setBackgroundUrl,
            showTasks, setShowTasks,
            searchQuery, setSearchQuery,
            filterStatus, setFilterStatus,
            filterLetterTypes, setFilterLetterTypes,
            filterDepartments, setFilterDepartments,
            filterPriorities, setFilterPriorities,
            filterDatePreset, setFilterDatePreset,
            filterCustomDateFrom, setFilterCustomDateFrom,
            filterCustomDateTo, setFilterCustomDateTo,
            sortOption, setSortOption,
            resetFilters,
            isEditingField,
            editingFieldValue,
            editingFieldConfig,
            isAiSuggesting,
            setEditingFieldValue,
            setEditingFieldConfig,
            handleOpenEditField,
            stopEditing,
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = (): UIContextType => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
