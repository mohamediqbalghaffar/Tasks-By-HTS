'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTask } from '@/contexts/TaskContext';
import { useUI } from '@/contexts/UIContext';
import LoadingAnimation from '@/components/ui/loading-animation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { renderDetailContent } from '@/lib/render-detail-content';
import { useMemo, Suspense } from 'react';

function ItemDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const { t, getDateFnsLocale } = useLanguage();

    const {
        getItemById,
        isLoading,
        handlePriorityChange,
        handleReminderChange,
        handleUrgencyChange,
        handleDelete,
        calculateDefaultReminder
    } = useTask();

    const { handleOpenEditField } = useUI();

    const actions = useMemo(() => ({
        handlePriorityChange,
        handleReminderChange,
        handleUrgencyChange,
        handleOpenEditField,
        handleDelete,
        calculateDefaultReminder
    }), [handlePriorityChange, handleReminderChange, handleUrgencyChange, handleOpenEditField, handleDelete, calculateDefaultReminder]);

    const itemResult = id ? getItemById(id) : null;
    const item = itemResult ? itemResult.item : null;

    if (isLoading) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    if (!item || !id) {
        // Handle case where ID is missing or item not found
        // Maybe redirect back or show error
        return (
            <div className="flex flex-col h-full items-center justify-center gap-4">
                <p>Item not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const isTask = 'taskNumber' in item;

    const title = isTask
        ? t('taskDetailModalTitle', { taskName: item.name })
        : t('letterDetailModalTitle', { letterName: item.name });

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b flex items-center gap-4 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-bold truncate">{title}</h1>
            </header>
            <ScrollArea className="flex-grow">
                <div className="p-4">
                    {renderDetailContent(item, actions, t, getDateFnsLocale)}
                </div>
            </ScrollArea>
        </div>
    );
}

export default function ItemDetailPage() {
    return (
        <Suspense fallback={<LoadingAnimation text="Loading..." />}>
            <ItemDetailContent />
        </Suspense>
    );
}
