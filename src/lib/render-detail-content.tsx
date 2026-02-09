
'use client';

import * as React from 'react';
import { Task, ApprovalLetter } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceStrict, addDays, addWeeks, set } from 'date-fns';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, Info, Star, Sigma, Building, Type, AlertTriangle, CalendarDays, Clock, Check, Edit, Trash2, Hourglass } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


import { SharedWithList } from '@/components/shared-with-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Copy } from 'lucide-react';

import { LetterNumberEditor } from '@/components/LetterNumberEditor';
import { toast } from '@/hooks/use-toast';

export interface DetailActions {
    handlePriorityChange: (id: string, type: 'task' | 'letter', priority: number) => Promise<void>;
    handleReminderChange: (id: string, type: 'task' | 'letter', date: Date | null) => Promise<void>;
    handleUrgencyChange: (item: Task | ApprovalLetter) => Promise<void>;
    handleOpenEditField: (item: Task | ApprovalLetter, field: any) => void;
    handleDelete: (id: string, type: 'task' | 'letter') => Promise<void>;
    calculateDefaultReminder: () => Date;
    handleDateChange: (id: string, type: 'task' | 'letter', date: Date) => Promise<void>;
    handleSaveField: (id: string, field: any, value: any, type: 'task' | 'letter', config?: any) => Promise<void>;
}

export const renderDetailContent = (
    item: (Task | ApprovalLetter) & {
        senderName?: string,
        senderPhotoURL?: string,
        senderUid?: string,
        _isShared?: boolean,
        _senderName?: string,
        _senderPhotoURL?: string,
        _sharedAt?: Date
    },
    actions: DetailActions,
    t: (key: string, params?: any) => string,
    getDateFnsLocale: () => any
) => {
    const { handlePriorityChange, handleReminderChange, handleUrgencyChange, handleOpenEditField, handleDelete, calculateDefaultReminder, handleDateChange, handleSaveField } = actions;
    const isTask = 'taskNumber' in item;
    const itemType = isTask ? 'task' : 'letter';

    const nameConfig = (item as any).nameConfig || { direction: 'rtl', fontSize: '1.25rem' };
    const detailConfig = (item as any).detailConfig || { direction: 'rtl', fontSize: '0.875rem' };
    const furtherDetailsConfig = (item as any).furtherDetailsConfig || { direction: 'rtl', fontSize: '0.875rem' };
    const resultConfig = (item as any).resultConfig || { direction: 'rtl', fontSize: '0.875rem' };

    const priorityOptions: { value: number, labelKey: string }[] = Array.from({ length: 10 }, (_, i) => ({ value: i + 1, labelKey: `priority${i + 1}` }));

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            description: t('copied'),
            duration: 2000,
        });
    };

    const isSharedConfig = item._isShared || item.senderName;
    const senderName = item._isShared ? item._senderName : item.senderName;
    const senderPhoto = item._isShared ? item._senderPhotoURL : item.senderPhotoURL;
    const sharedAt = item._sharedAt; // Or if senderName/senderUid implies sharing but no date?

    return (
        <div className="space-y-6" dir="rtl">
            {isSharedConfig && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background">
                                <AvatarImage src={senderPhoto} />
                                <AvatarFallback>{senderName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('sharedBy')}</p>
                                <p className="font-semibold text-primary">{senderName}</p>
                            </div>
                        </div>
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    {sharedAt && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2 px-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceStrict(sharedAt, new Date(), { locale: getDateFnsLocale(), addSuffix: true })}</span>
                        </div>
                    )}
                </div>
            )}

            <div>
                <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm text-muted-foreground">{t(isTask ? 'taskNameValueLabel' : 'letterNameValueLabel')}</Label>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditField(item, 'name')}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('edit')}
                    </Button>
                </div>
                <h3
                    className="font-bold text-xl text-foreground break-words max-w-prose"
                    style={{ direction: nameConfig.direction, fontSize: nameConfig.fontSize }}
                >
                    {item.name}
                </h3>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm text-muted-foreground">{t(isTask ? 'taskDetailValueLabel' : 'letterDetailValueLabel')}</Label>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditField(item, 'detail')}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('edit')}
                    </Button>
                </div>
                <p
                    className="text-sm text-foreground whitespace-pre-wrap break-words max-w-prose"
                    style={{ direction: detailConfig.direction, fontSize: detailConfig.fontSize }}
                >
                    {item.detail}
                </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 text-sm">
                {/* Column 1 */}
                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <Star className="h-5 w-5 mt-1 text-primary shrink-0" />
                        <div className="w-full">
                            <Label className="font-semibold text-foreground">{t('priorityLabel')}</Label>
                            <Select value={String(item.priority)} onValueChange={(value) => handlePriorityChange(item.id, itemType, parseInt(value))}>
                                <SelectTrigger className="mt-1 w-full"><SelectValue placeholder={t('selectPriority')} /></SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map(p => (
                                        <SelectItem key={p.value} value={String(p.value)}>
                                            {p.value} - {t(p.labelKey)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <Sigma className="h-5 w-5 mt-1 text-primary shrink-0" />
                        <div className="flex-1">
                            <Label className="text-sm text-muted-foreground">{t(isTask ? 'taskNumberValueLabel' : 'letterNumberValueLabel')}</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="font-mono text-lg text-foreground">
                                    {isTask ? (item as Task).taskNumber : `${(item as ApprovalLetter).letterCode} / ${(item as ApprovalLetter).letterNumber}`}
                                </p>
                                {!isTask && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => copyToClipboard(`${(item as ApprovalLetter).letterCode} / ${(item as ApprovalLetter).letterNumber}`)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        <LetterNumberEditor
                                            item={item as ApprovalLetter}
                                            onSave={handleSaveField}
                                            t={t}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isTask && (
                        <>
                            <div className="flex items-start gap-4">
                                <Building className="h-5 w-5 mt-1 text-primary shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm text-muted-foreground">{t('sentToLabel')}</Label>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenEditField(item, 'sentTo')}>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <p className="text-foreground">{t((item as ApprovalLetter).sentTo || '') || (item as ApprovalLetter).sentTo || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Type className="h-5 w-5 mt-1 text-primary shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm text-muted-foreground">{t('letterTypeLabel')}</Label>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenEditField(item, 'letterType')}>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <p className="text-foreground">{t((item as ApprovalLetter).letterType || '') || (item as ApprovalLetter).letterType || '-'}</p>
                                </div>
                            </div>
                        </>
                    )}
                    <Button
                        onClick={() => handleUrgencyChange(item)}
                        variant={item.isUrgent ? "destructive" : "outline"}
                        className={cn("w-full transition-all", item.isUrgent && "urgent-pulse-glow")}
                    >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        {t('urgent')}
                    </Button>
                </div>

                {/* Column 2 */}
                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <CalendarDays className="h-5 w-5 mt-1 text-primary shrink-0" />
                        <div className="w-full">
                            <Label className="text-sm text-muted-foreground">{t('startTimeLabel')}</Label>
                            {/* Editable Start Time */}
                            <DateTimePicker
                                date={item.startTime}
                                onSave={(newDate) => {
                                    if (newDate) handleDateChange(item.id, itemType, newDate);
                                }}
                                triggerButton={
                                    <Button variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {item.startTime ? format(item.startTime, 'P', { locale: getDateFnsLocale() }) : <span>{t('pickADate')}</span>}
                                    </Button>
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <Clock className="h-5 w-5 mt-1 text-primary shrink-0" />
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-1">
                                <Label className="font-semibold text-foreground">{t('reminderLabel')}</Label>
                            </div>
                            <DateTimePicker
                                date={item.reminder}
                                onSave={(newDate) => handleReminderChange(item.id, itemType, newDate)}
                                onSelectDefault={() => handleReminderChange(item.id, itemType, calculateDefaultReminder())}
                                triggerButton={
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",
                                        !item.reminder && "text-muted-foreground",
                                        item.reminder && !item.isDone && new Date(item.reminder) < new Date() && "ring-2 ring-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] border-yellow-500 bg-yellow-50/10"
                                    )} disabled={item.id.startsWith('local-')}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {item.reminder ? format(item.reminder, "dd/MM/yyyy hh:mm a") : <span>{t('pickADateAndTime')}</span>}
                                    </Button>
                                }
                            />

                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <Check className="h-5 w-5 mt-1 text-primary shrink-0" />
                        <div>
                            <Label className="text-sm text-muted-foreground">{t('durationLabel')}</Label>
                            <p className="text-foreground">{formatDistanceStrict(new Date(), item.startTime, { locale: getDateFnsLocale(), addSuffix: false })}</p>
                        </div>
                    </div>
                    {item.isDone && (
                        <div className="flex items-start gap-4">
                            <Hourglass className="h-5 w-5 mt-1 text-primary shrink-0" />
                            <div>
                                <Label className="text-sm text-muted-foreground">{t('timeToComplete')}</Label>
                                <p className="text-foreground">{formatDistanceStrict(item.completedAt || item.updatedAt, item.createdAt, { locale: getDateFnsLocale() })}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-muted-foreground">{t('furtherDetailsValueLabel')}</Label>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditField(item, 'furtherDetails')}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('edit')}
                    </Button>
                </div>
                <Card className="mt-2 bg-secondary/50">
                    <CardContent className="p-3 min-h-[60px] whitespace-pre-wrap break-words text-sm text-foreground max-w-prose" style={{ direction: furtherDetailsConfig.direction, fontSize: furtherDetailsConfig.fontSize }}>
                        {item.furtherDetails || <span className="text-muted-foreground">{t('noContentYet')}</span>}
                    </CardContent>
                </Card>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-muted-foreground">{t('resultIfDoneLabel')}</Label>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditField(item, 'result')} disabled={!item.isDone}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('edit')}
                    </Button>
                </div>
                <Card className="mt-2 bg-secondary/50">
                    <CardContent className="p-3 min-h-[60px] whitespace-pre-wrap break-words text-sm text-foreground max-w-prose" style={{ direction: resultConfig.direction, fontSize: resultConfig.fontSize }}>
                        {item.result || <span className="text-muted-foreground">{!item.isDone ? t('completeToEdit') : t('noContentYet')}</span>}
                    </CardContent>
                </Card>
            </div>

            <Separator />

            <div className="pt-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('delete')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>{t(isTask ? 'confirmDeleteTaskDescription' : 'confirmDeleteLetterDescription')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDelete(item.id, itemType)}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {t('confirmDelete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Show SharedWithList only if I am the owner (no senderName means I created it usually, or logic can be stricter) */}
            {!item.senderName && (
                <SharedWithList itemId={item.id} itemType={itemType} />
            )}
        </div>
    );
};

