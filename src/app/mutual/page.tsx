'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTask } from '@/contexts/TaskContext';
import { format } from 'date-fns';
import { UserIcon } from 'lucide-react';
import { ItemCard, ShareDialog } from '@/components/item-card';
import { Task, ApprovalLetter } from '@/contexts/LanguageContext';
import { ReceivedItem } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PanelRight, PanelLeft, ChevronsLeft, ListTodo, FileText, Send, Inbox, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUI } from '@/contexts/UIContext';
import { renderDetailContent } from '@/lib/render-detail-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MutualPage() {
    // Define types for mutual items that include sender info
    type MutualTask = Task & {
        _receivedItem: ReceivedItem;
        senderName: string;
        senderPhotoURL?: string | null;
        senderUid: string;
    };

    type MutualLetter = ApprovalLetter & {
        _receivedItem: ReceivedItem;
        senderName: string;
        senderPhotoURL?: string | null;
        senderUid: string;
    };

    type MutualItem = MutualTask | MutualLetter;

    // Type for Sent Items (which are just regular tasks/letters with sharedCount > 0)
    // We can reuse Task/ApprovalLetter but for consistency in this page helper types:
    type SentItem = Task | ApprovalLetter;

    const { t, getDateFnsLocale } = useLanguage();
    const {
        receivedItems,
        tasks,
        approvalLetters,
        expiredTasksList,
        expiredApprovalLettersList,
        toggleIsDone,
        handleDelete: contextHandleDelete,
        shareItem,
        markAsSeen,
        updateReceivedItem,
        deleteReceivedItem,
        resyncReceivedItems
    } = useTask();
    const { handleOpenEditField } = useUI();
    const [selectedItem, setSelectedItem] = useState<MutualItem | SentItem | null>(null);
    const [activeTab, setActiveTab] = useState('received');
    const [viewType, setViewType] = useState<'task' | 'letter'>('task');
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

    // Map received items to Task | ApprovalLetter for ItemCard
    const mappedItems = useMemo(() => {
        return receivedItems.map(item => {
            const baseItem = {
                ...item.data,
                id: item.id, // Use the received item ID
                senderName: item.senderName,
                senderPhotoURL: item.senderPhotoURL,
                senderUid: item.senderUid,
                _receivedItem: item,
                createdAt: item.sharedAt?.toDate ? item.sharedAt.toDate() : new Date(),
                updatedAt: item.sharedAt?.toDate ? item.sharedAt.toDate() : new Date(),
            };

            // Ensure type discrimination properties are present
            if (item.originalItemType === 'task') {
                return { ...baseItem, taskNumber: (baseItem as any).taskNumber || 0 } as MutualTask;
            } else {
                return { ...baseItem, letterNumber: (baseItem as any).letterNumber || 0 } as MutualLetter;
            }
        });
    }, [receivedItems]);

    // Filter received items based on viewType
    const filteredReceivedItems = useMemo(() => {
        return mappedItems.filter(item => {
            if (viewType === 'task') return 'taskNumber' in item;
            return 'letterNumber' in item;
        });
    }, [mappedItems, viewType]);

    // Sent Items Logic - Include ACTIVE and EXPIRED items
    const sentItems = useMemo(() => {
        const allTasks = [...tasks, ...expiredTasksList];
        const allLetters = [...approvalLetters, ...expiredApprovalLettersList];

        const sharedTasks = allTasks.filter(t => t.sharedCount && t.sharedCount > 0);
        const sharedLetters = allLetters.filter(l => l.sharedCount && l.sharedCount > 0);

        // Filter by viewType
        if (viewType === 'task') {
            return sharedTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } else {
            return sharedLetters.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
    }, [tasks, approvalLetters, expiredTasksList, expiredApprovalLettersList, viewType]);

    // Group items by sender (using filtered received items)
    const groupedItems = useMemo(() => {
        const groups: Record<string, MutualItem[]> = {};
        filteredReceivedItems.forEach(item => {
            const senderKey = item._receivedItem.senderUid || 'unknown';
            if (!groups[senderKey]) {
                groups[senderKey] = [];
            }
            groups[senderKey].push(item);
        });
        return groups;
    }, [filteredReceivedItems]);

    const handleCardClick = (item: Task | ApprovalLetter) => {
        setSelectedItem(item as MutualItem);
        if (!isDetailViewOpen) {
            setIsDetailViewOpen(true);
        }
    };

    // Specific delete handler for shared items
    const handleSharedItemDelete = async (id: string, type: 'task' | 'letter') => {
        await deleteReceivedItem(id);
        if (selectedItem?.id === id) {
            setSelectedItem(null);
            setIsDetailViewOpen(false);
        }
    };

    // Mark as seen when item is opened
    useEffect(() => {
        if (selectedItem && '_receivedItem' in selectedItem) {
            // It's a mapped item with the received item attached
            const receivedItem = (selectedItem as any)._receivedItem as ReceivedItem;
            markAsSeen(receivedItem);
        }
    }, [selectedItem, markAsSeen]);

    const masterView = (
        <div className="flex flex-col h-full overflow-hidden p-4">
            <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <UserIcon className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {t('mutualItems')}
                </h1>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={resyncReceivedItems}
                    className="ml-auto rounded-full"
                    title={t('sync') || 'Sync'}
                >
                    <RefreshCw className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex justify-center mb-6">
                <div className="bg-muted p-1 rounded-lg inline-flex shadow-sm">
                    <Button
                        variant={viewType === 'task' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewType('task')}
                        className="w-24 font-medium transition-all"
                    >
                        {t('tasks') || 'Tasks'}
                    </Button>
                    <Button
                        variant={viewType === 'letter' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewType('letter')}
                        className="w-24 font-medium transition-all"
                    >
                        {t('letters') || 'Letters'}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="received" value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="received" className="flex items-center gap-2">
                        <Inbox className="h-4 w-4" />
                        {t('received')}
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        {t('sent')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="received" className="flex-grow min-h-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-6 pr-2 pb-4">
                            {Object.keys(groupedItems).length > 0 ? (
                                Object.entries(groupedItems).map(([senderUid, items]) => (
                                    <div key={senderUid} className="space-y-3">
                                        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border border-border/50 sticky top-0 z-10 backdrop-blur-sm">
                                            <Avatar className="h-8 w-8 border border-primary/20">
                                                <AvatarImage src={items[0].senderPhotoURL || undefined} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {items[0].senderName?.charAt(0) || <UserIcon className="h-4 w-4" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{items[0].senderName || t('unknownSender')}</span>
                                                <span className="text-[10px] text-muted-foreground">{t('itemsCount')}: {items.length}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pl-2 border-l-2 border-primary/10 ml-4">
                                            {items.map((item) => (
                                                <ItemCard
                                                    key={item.id}
                                                    item={item}
                                                    isSelected={selectedItem?.id === item.id}
                                                    onCardClick={handleCardClick}
                                                    toggleIsDone={toggleIsDone}
                                                    handleDelete={handleSharedItemDelete}
                                                    shareItem={shareItem}
                                                    t={t}
                                                    getDateFnsLocale={getDateFnsLocale}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-60">
                                    <Inbox className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-lg">{t('noMutualItems') || "No mutual items found"}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="sent" className="flex-grow min-h-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-6 pr-2 pb-4">
                            {sentItems.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border border-border/50 sticky top-0 z-10 backdrop-blur-sm">
                                        <div className="p-1.5 bg-primary/10 rounded-full text-primary">
                                            <Send className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{t('mySharedItems') || 'Shared by me'}</span>
                                            <span className="text-[10px] text-muted-foreground">{t('itemsCount')}: {sentItems.length}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pl-2 border-l-2 border-primary/10 ml-4">
                                        {sentItems.map((item) => (
                                            <ItemCard
                                                key={item.id}
                                                item={item}
                                                isSelected={selectedItem?.id === item.id}
                                                onCardClick={handleCardClick}
                                                toggleIsDone={toggleIsDone}
                                                handleDelete={contextHandleDelete} // Use context delete for own items
                                                shareItem={shareItem}
                                                t={t}
                                                getDateFnsLocale={getDateFnsLocale}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-60">
                                    <Send className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-lg">{t('noSentItems') || "No sent items found"}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div >
    );

    // Actions for detail view
    const actions = {
        handlePriorityChange: async (id: string, type: 'task' | 'letter', priority: number) => {
            await updateReceivedItem(id, 'priority', priority);
        },
        handleReminderChange: async (id: string, type: 'task' | 'letter', date: Date | null) => {
            await updateReceivedItem(id, 'reminder', date);
        },
        handleDateChange: async (id: string, type: 'task' | 'letter', date: Date | null) => {
            // Mapping for completeness, though detail view typically uses handleReminderChange or other specific handlers
            // If this is for "Due Date" or "Start Date", we might need specific logic.
            // Usually renderDetailContent uses this for generic date fields?
            // Since we don't have a distinct 'date' field in generic usage, assume reminder or ignore.
            await updateReceivedItem(id, 'reminder', date);
        },
        handleUrgencyChange: async (item: Task | ApprovalLetter) => {
            await updateReceivedItem(item.id, 'isUrgent', !item.isUrgent);
        },
        handleSaveField: async (id: string, field: string, value: any, config?: any) => {
            await updateReceivedItem(id, field, value, config);
        },
        handleOpenEditField: (item: Task | ApprovalLetter, field: any) => {
            handleOpenEditField(item, field);
        },
        handleDelete: async (id: string, type: 'task' | 'letter') => {
            await deleteReceivedItem(id);
            setSelectedItem(null);
            setIsDetailViewOpen(false);
        },
        calculateDefaultReminder: () => new Date(),
    };

    const detailView = (
        <Card className="glass-card flex flex-col h-full">
            <CardHeader className="flex flex-row-reverse justify-between items-center shrink-0">
                {selectedItem ? (
                    <div className="flex items-center gap-3 flex-row-reverse">
                        <div className="bg-primary/20 text-primary p-2 rounded-full">
                            {'taskNumber' in selectedItem! ? <ListTodo className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                        </div>
                        <div className="text-right">
                            <CardTitle className="text-base font-bold">{selectedItem.name}</CardTitle>
                        </div>
                        <ShareDialog item={selectedItem as Task | ApprovalLetter} onShare={shareItem} t={t} />
                    </div>
                ) : <div></div>}
                <Button variant="ghost" size="icon" onClick={() => setIsDetailViewOpen(false)}>
                    <ChevronsLeft className="h-5 w-5" />
                </Button>
            </CardHeader>
            <ScrollArea className="flex-grow">
                <CardContent className="pt-6">
                    {selectedItem ? (
                        renderDetailContent(selectedItem as any, actions, t, getDateFnsLocale) // Cast to any to bypass strict type check for sender props which we added
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                            <PanelRight className="h-12 w-12 mb-4" />
                            <h3 className="text-lg font-semibold">{t('selectAnItem')}</h3>
                            <p className="text-sm">{t('selectAnItemDesc')}</p>
                        </div>
                    )}
                </CardContent>
            </ScrollArea>
        </Card>
    );

    return (
        <div className="h-full" dir="rtl">
            <div className={cn(
                "h-full transition-all duration-300 ease-in-out grid gap-4 p-4",
                isDetailViewOpen ? 'lg:grid-cols-[2fr_3fr] grid-cols-1' : 'grid-cols-1'
            )}>
                <div className={cn(
                    "flex flex-col min-h-0 h-full relative",
                    isDetailViewOpen ? "hidden lg:flex" : "flex"
                )}>
                    {masterView}
                    {!isDetailViewOpen && selectedItem && (
                        <div className="absolute top-1/2 left-0 -translate-y-1/2">
                            <Button size="icon" onClick={() => setIsDetailViewOpen(true)} className="rounded-r-full rounded-l-none h-16 w-8">
                                <PanelLeft className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
                {isDetailViewOpen && (
                    <div className="flex flex-col min-h-0 h-full">
                        {detailView}
                    </div>
                )}
            </div>
        </div>
    );
}
