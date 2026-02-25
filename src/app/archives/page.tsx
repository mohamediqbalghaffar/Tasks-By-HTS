
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTask } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Trash, Undo, CheckCircle, AlertTriangle } from 'lucide-react';
import LoadingAnimation from '@/components/ui/loading-animation';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';

const ArchiveCategoryCard = ({
    title,
    description,
    icon,
    searchQuery,
    setSearchQuery,
    items,
    renderItem,
    onCleanup,
    cleanupLabel,
    noItemsLabel,
    confirmCleanupDescription
}: any) => {
    const { t } = useLanguage();
    return (
        <Card className="flex flex-col h-[420px] glass-card border-x-0 sm:border-x border-b-0 sm:border-b border-t sm:rounded-3xl rounded-t-2xl shadow-xl transition-all duration-300 backdrop-blur-3xl bg-white/5 dark:bg-black/20 overflow-hidden">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary ring-1 ring-primary/20">
                            {icon}
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground/80">{description}</CardDescription>
                        </div>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={items.length === 0} title={cleanupLabel} className="h-9 w-9 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20">
                                <Trash className="h-4.5 w-4.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card backdrop-blur-3xl border-white/10">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                    <Trash className="h-5 w-5" />
                                    {t('confirmCleanupTitle')}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="bg-destructive/5 p-3 rounded-lg text-destructive/80 font-medium">
                                    {confirmCleanupDescription}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel className="rounded-xl border-white/10">{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={onCleanup} className="bg-destructive hover:bg-destructive/90 rounded-xl shadow-lg shadow-destructive/20 transform active:scale-95 transition-all font-bold">{t('confirmDelete')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>


            <div className="px-6 py-4 bg-black/5 dark:bg-black/20 border-b border-white/5">
                <div className="relative group/search">
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-4 pr-10 glass-input border-white/10 focus:ring-primary/30 transition-all rounded-xl h-10 text-sm"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover/search:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                </div>
            </div>

            <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
                <ScrollArea className="flex-grow h-full w-full custom-scrollbar">
                    <div className="p-4 pt-0">
                        {items.length > 0 ? (
                            <ul className="space-y-2">
                                {items.map((item: any) => renderItem(item))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-center opacity-60">
                                <div className="p-3 bg-muted/50 rounded-full mb-3">
                                    {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6 opacity-40 grayscale" })}
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">{noItemsLabel}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default function ArchivesPage() {
    const { t, getDateFnsLocale } = useLanguage();
    const router = useRouter();
    const {
        isMounted,
        tasks,
        approvalLetters,
        expiredTasksList,
        expiredApprovalLettersList,
        handleReactivateFromCompleted,
        handleDelete,
        handleCleanUp,
    } = useTask();

    const [isLoadingArchives, setIsLoadingArchives] = useState(true);

    const [completedTasksSearch, setCompletedTasksSearch] = useState('');
    const [completedLettersSearch, setCompletedLettersSearch] = useState('');
    const [expiredTasksSearch, setExpiredTasksSearch] = useState('');
    const [expiredLettersSearch, setExpiredLettersSearch] = useState('');

    useEffect(() => {
        setIsLoadingArchives(true);
        const timer = setTimeout(() => setIsLoadingArchives(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const completedTasks = tasks.filter(task => task.isDone);
    const completedApprovalLetters = approvalLetters.filter(letter => letter.isDone);

    const filterItems = (items: any[], query: string) => {
        if (!query) return items;
        const lowerQuery = query.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(lowerQuery) ||
            item.detail.toLowerCase().includes(lowerQuery) ||
            (item.result && item.result.toLowerCase().includes(lowerQuery))
        );
    };

    const filteredCompletedTasks = filterItems(completedTasks, completedTasksSearch);
    const filteredCompletedLetters = filterItems(completedApprovalLetters, completedLettersSearch);
    const filteredExpiredTasks = filterItems(expiredTasksList, expiredTasksSearch);
    const filteredExpiredLetters = filterItems(expiredApprovalLettersList, expiredLettersSearch);

    const renderListItem = (item: any, type: 'task' | 'letter', listContext: 'completed' | 'expired') => {
        const locale = getDateFnsLocale();

        return (
            <li key={item.id} className="group relative p-3.5 border border-white/5 bg-white/5 dark:bg-black/20 rounded-2xl flex justify-between items-center flex-row-reverse transition-all hover:bg-white/10 dark:hover:bg-white/5 hover:border-white/20 active:scale-[0.98] cursor-pointer">
                <div
                    className="flex-grow text-right min-w-0"
                    onClick={() => router.push(`/item?id=${item.id}`)}
                >
                    <p className="font-bold truncate text-sm group-hover:text-primary transition-colors">{item.name}</p>
                    {listContext === 'completed' && (
                        <p className="text-[10px] text-muted-foreground/80 truncate flex items-center justify-end gap-1.5 mt-1 font-medium">
                            {format(item.updatedAt, 'PPP', { locale })}
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 opacity-80" />
                        </p>
                    )}
                    {listContext === 'expired' && item.reminder && (
                        <p className="text-[10px] text-rose-400 truncate flex items-center justify-end gap-1.5 mt-1 font-medium">
                            {formatDistanceToNow(item.reminder, { addSuffix: true, locale })}
                            <AlertTriangle className="h-3.5 w-3.5 opacity-80" />
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-row-reverse shrink-0 pl-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    {listContext === 'completed' && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:scale-110 transition-all" onClick={(e) => { e.stopPropagation(); handleReactivateFromCompleted(item.id, type); }} title={t('reactivate')}>
                            <Undo className="h-4 w-4" />
                        </Button>
                    )}
                    {listContext === 'expired' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 hover:scale-110 transition-all" onClick={(e) => e.stopPropagation()} title={t('deletePermanently')}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card backdrop-blur-3xl border-white/10">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold">{t('confirmPermanentDeleteTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription className="bg-destructive/5 p-3 rounded-xl text-destructive/80 font-medium">
                                        {t(type === 'task' ? 'confirmDeleteTaskDescription' : 'confirmDeleteLetterDescription')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel className="rounded-xl border-white/10">{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id, type)} className="bg-destructive hover:bg-destructive/90 rounded-xl font-bold">{t('confirmDelete')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </li>
        );
    };

    if (!isMounted || isLoadingArchives) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    return (
        <div className="p-4 md:p-6 flex flex-col min-h-full" dir="rtl">
            <div className="shrink-0 mb-8 mt-2">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-l from-foreground to-foreground/70 bg-clip-text text-transparent">{t('archives')}</h1>
                <p className="text-sm text-muted-foreground/80 font-medium">{t('archivesDescription')}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
                <ArchiveCategoryCard
                    title={t('completedTasks')}
                    description={t('itemsCompleted')}
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                    searchQuery={completedTasksSearch}
                    setSearchQuery={setCompletedTasksSearch}
                    items={filteredCompletedTasks}
                    renderItem={(item: any) => renderListItem(item, 'task', 'completed')}
                    onCleanup={() => handleCleanUp('completedTasks')}
                    cleanupLabel={t('cleanupButtonLabel')}
                    noItemsLabel={t('noCompletedTasks')}
                    confirmCleanupDescription={t('confirmCleanupDescription', { count: filteredCompletedTasks.length })}
                />
                <ArchiveCategoryCard
                    title={t('completedLetters')}
                    description={t('itemsCompleted')}
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                    searchQuery={completedLettersSearch}
                    setSearchQuery={setCompletedLettersSearch}
                    items={filteredCompletedLetters}
                    renderItem={(item: any) => renderListItem(item, 'letter', 'completed')}
                    onCleanup={() => handleCleanUp('completedLetters')}
                    cleanupLabel={t('cleanupButtonLabel')}
                    noItemsLabel={t('noCompletedLetters')}
                    confirmCleanupDescription={t('confirmCleanupDescription', { count: filteredCompletedLetters.length })}
                />
                <ArchiveCategoryCard
                    title={t('expiredTasks')}
                    description={t('requireImmediateAttention')}
                    icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
                    searchQuery={expiredTasksSearch}
                    setSearchQuery={setExpiredTasksSearch}
                    items={filteredExpiredTasks}
                    renderItem={(item: any) => renderListItem(item, 'task', 'expired')}
                    onCleanup={() => handleCleanUp('expiredTasks')}
                    cleanupLabel={t('cleanupButtonLabel')}
                    noItemsLabel={t('noExpiredTasks')}
                    confirmCleanupDescription={t('confirmCleanupDescription', { count: filteredExpiredTasks.length })}
                />
                <ArchiveCategoryCard
                    title={t('expiredLetters')}
                    description={t('requireImmediateAttention')}
                    icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
                    searchQuery={expiredLettersSearch}
                    setSearchQuery={setExpiredLettersSearch}
                    items={filteredExpiredLetters}
                    renderItem={(item: any) => renderListItem(item, 'letter', 'expired')}
                    onCleanup={() => handleCleanUp('expiredLetters')}
                    cleanupLabel={t('cleanupButtonLabel')}
                    noItemsLabel={t('noExpiredLetters')}
                    confirmCleanupDescription={t('confirmCleanupDescription', { count: filteredExpiredLetters.length })}
                />
            </div>
        </div>
    );
}

