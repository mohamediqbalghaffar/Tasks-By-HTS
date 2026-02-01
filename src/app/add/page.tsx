'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTask } from '@/contexts/TaskContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { format, addHours, addDays, set } from 'date-fns';
import { CalendarIcon, PlusCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FormContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
            {children}
        </CardContent>
    </Card>
);

export default function AddPage() {
    const { t, language, getDateFnsLocale } = useLanguage();
    const { handleSave, calculateDefaultReminder, getItemById, tasks, approvalLetters } = useTask();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Set active tab based on URL query parameter, defaulting to 'letter'
    const initialTab = searchParams.get('tab') === 'task' ? 'task' : 'letter';
    const activeTabParam = (searchParams.get('tab') as 'task' | 'letter') || 'letter';
    const [activeTab, setActiveTab] = useState<'task' | 'letter'>(initialTab);

    // Edit Mode State
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;

    // Task state
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDetail, setNewTaskDetail] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<number>(5);
    const [newTaskIsUrgent, setNewTaskIsUrgent] = useState(false);
    const [newTaskReminder, setNewTaskReminder] = useState<Date | null>(null);
    const [newTaskStartTime, setNewTaskStartTime] = useState<Date | null>(null);
    const [useCurrentTimeTask, setUseCurrentTimeTask] = useState(true);

    // Letter state
    const [newLetterName, setNewLetterName] = useState('');
    const [newLetterCode, setNewLetterCode] = useState('');
    const [newLetterDetail, setNewLetterDetail] = useState('');
    const [newLetterSentTo, setNewLetterSentTo] = useState('');
    const [newLetterLetterType, setNewLetterLetterType] = useState('');
    const [newLetterPriority, setNewLetterPriority] = useState<number>(5);
    const [newLetterIsUrgent, setNewLetterIsUrgent] = useState(false);
    const [newLetterReminder, setNewLetterReminder] = useState<Date | null>(null);
    const [newLetterStartTime, setNewLetterStartTime] = useState<Date | null>(null);
    const [useCurrentTimeLetter, setUseCurrentTimeLetter] = useState(true);

    // Populate form if editing
    useEffect(() => {
        if (editId) {
            const result = getItemById(editId);
            if (result) {
                const { item, type } = result;
                if (type === 'task' && 'taskNumber' in item) {
                    setActiveTab('task');
                    setNewTaskName(item.name);
                    setNewTaskDetail(item.detail);
                    setNewTaskPriority(item.priority);
                    setNewTaskIsUrgent(item.isUrgent || false);
                    setNewTaskReminder(item.reminder ? new Date(item.reminder) : null);
                    if (item.createdAt) {
                        setNewTaskStartTime(new Date(item.createdAt));
                        setUseCurrentTimeTask(false);
                    }
                } else if (type === 'letter' && 'letterNumber' in item) {
                    setActiveTab('letter');
                    setNewLetterName(item.name);
                    setNewLetterCode((item as any).letterCode || '');
                    setNewLetterDetail(item.detail);
                    setNewLetterSentTo((item as any).sentTo || '');
                    setNewLetterLetterType((item as any).letterType || '');
                    setNewLetterPriority(item.priority);
                    setNewLetterIsUrgent(item.isUrgent || false);
                    setNewLetterReminder(item.reminder ? new Date(item.reminder) : null);
                    if (item.createdAt) {
                        setNewLetterStartTime(new Date(item.createdAt));
                        setUseCurrentTimeLetter(false);
                    }
                }
            }
        }
    }, [editId, getItemById, tasks, approvalLetters]);



    const handleAddTask = async () => {
        if (!newTaskName.trim()) {
            toast({ title: t('error'), description: t('taskNameRequired'), variant: "destructive" });
            return;
        }

        let reminderToSave = newTaskReminder;
        if (newTaskIsUrgent && !reminderToSave) {
            const now = new Date();
            reminderToSave = now.getHours() >= 15
                ? set(addDays(now, 1), { hours: 8, minutes: 30, seconds: 0, milliseconds: 0 })
                : addHours(now, 2);
        } else if (!reminderToSave) {
            reminderToSave = calculateDefaultReminder();
        }

        // Use custom start time as creation time if selected
        const effectiveCreationTime = useCurrentTimeTask ? new Date() : (newTaskStartTime || new Date());

        const taskData = {
            name: newTaskName,
            detail: newTaskDetail,
            priority: newTaskPriority,
            isUrgent: newTaskIsUrgent,
            reminder: reminderToSave,
            startTime: effectiveCreationTime,
            createdAt: effectiveCreationTime // This will overwrite createdAt on edit if we pass it. TaskContext logic handles if we want to ignore it? No, TaskContext updates it. Ideally we pass original createdAt? But here we overwrite with effectiveCreationTime which is set to original in useEffect. So it's fine.
        };
        const success = await handleSave(editId || 'new', 'task', taskData);
        if (success) {
            toast({ description: isEditMode ? t('taskUpdatedSuccess') : t('taskAddedSuccess') });
            router.push('/');
        }
    };

    const handleAddLetter = async () => {
        if (!newLetterName.trim()) {
            toast({ title: t('error'), description: t('letterNameRequired'), variant: "destructive" });
            return;
        }

        let reminderToSave = newLetterReminder;
        if (newLetterIsUrgent && !reminderToSave) {
            const now = new Date();
            reminderToSave = now.getHours() >= 15
                ? set(addDays(now, 1), { hours: 8, minutes: 30, seconds: 0, milliseconds: 0 })
                : addHours(now, 2);
        } else if (!reminderToSave) {
            reminderToSave = calculateDefaultReminder();
        }

        // Use custom start time as creation time if selected
        const effectiveCreationTime = useCurrentTimeLetter ? new Date() : (newLetterStartTime || new Date());

        const letterData = {
            name: newLetterName,
            letterCode: newLetterCode,
            detail: newLetterDetail,
            sentTo: newLetterSentTo,
            letterType: newLetterLetterType,
            priority: newLetterPriority,
            isUrgent: newLetterIsUrgent,
            reminder: reminderToSave,
            startTime: effectiveCreationTime,
            createdAt: effectiveCreationTime
        };
        const success = await handleSave(editId || 'new', 'letter', letterData);
        if (success) {
            toast({ description: isEditMode ? t('letterUpdatedSuccess') : t('letterAddedSuccess') });
            router.push('/');
        }
    };

    const priorityOptions: { value: number, labelKey: string }[] = Array.from({ length: 10 }, (_, i) => ({ value: i + 1, labelKey: `priority${i + 1}` }));

    const departmentOptions = [
        'sentTo_chairman',
        'sentTo_ceo',
        'sentTo_hr',
        'sentTo_accounting',
        'sentTo_supply_chain',
        'sentTo_equipment',
    ];
    const officeOptions = [
        'sentTo_office_slemani',
        'sentTo_office_kirkuk',
        'sentTo_office_diyala',
    ];

    const letterTypeOptions = [
        'letterType_general',
        'letterType_termination',
        'letterType_service_extension',
        'letterType_candidacy',
        'letterType_position_change',
        'letterType_commencement',
        'letterType_confirmation',
        'letterType_leave',
        'letterType_material_request',
        'letterType_material_return',
    ];

    return (
        <div className="flex flex-col h-full p-4 md:p-6" dir="rtl">
            <div className="flex-grow">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'task' | 'letter')} className="w-full max-w-4xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="letter">{t('lettersTab')}</TabsTrigger>
                        <TabsTrigger value="task">{t('tasksTab')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="task" className="mt-6">
                        <FormContentWrapper>
                            <div className="grid grid-cols-[1fr,auto] items-center gap-x-4">
                                <Input id="task-name" placeholder={t('taskNamePlaceholder')} value={newTaskName} onChange={e => setNewTaskName(e.target.value)} dir="rtl" />
                                <Label htmlFor="task-name" className="whitespace-nowrap">{t('taskNameLabel')}</Label>
                            </div>
                            <div className="grid grid-cols-[1fr,auto] items-start gap-x-4">
                                <Textarea id="task-detail" placeholder={t('taskDetailPlaceholder')} value={newTaskDetail} onChange={e => setNewTaskDetail(e.target.value)} rows={3} dir="rtl" />
                                <Label htmlFor="task-detail" className="whitespace-nowrap pt-2">{t('taskDetailLabel')}</Label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-[1fr,auto] items-center gap-x-4">
                                    <Select value={String(newTaskPriority)} onValueChange={(v) => setNewTaskPriority(Number(v))}>
                                        <SelectTrigger><SelectValue placeholder={t('selectPriority')} /></SelectTrigger>
                                        <SelectContent>{priorityOptions.map(p => <SelectItem key={p.value} value={String(p.value)}>{p.value} - {t(p.labelKey)}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Label className="whitespace-nowrap">{t('priorityLabel')}</Label>
                                </div>
                                <div className="flex items-center justify-end gap-x-2">
                                    <Switch id="new-task-urgent-dialog" checked={newTaskIsUrgent} onCheckedChange={setNewTaskIsUrgent} />
                                    <Label htmlFor="new-task-urgent-dialog" className="text-destructive font-semibold">{t('urgent')}</Label>
                                </div>
                            </div>

                            {/* Start Time Section */}
                            <div className="space-y-3 border p-4 rounded-lg bg-muted/30">
                                <Label className="text-base font-semibold block mb-2">{t('startTimeLabel')}</Label>
                                <RadioGroup value={useCurrentTimeTask ? 'current' : 'custom'} onValueChange={(v) => setUseCurrentTimeTask(v === 'current')} className="flex flex-col gap-2">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value="current" id="task-current-time" />
                                        <Label htmlFor="task-current-time" className="cursor-pointer">{t('useCurrentTime')} ({t('currentTime')}: {format(new Date(), 'p')})</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value="custom" id="task-custom-time" />
                                        <Label htmlFor="task-custom-time" className="cursor-pointer">{t('useCustomTime')}</Label>
                                    </div>
                                </RadioGroup>

                                {!useCurrentTimeTask && (
                                    <div className="mr-8 mt-2 animate-in fade-in slide-in-from-top-2">
                                        <DateTimePicker
                                            date={newTaskStartTime}
                                            onSave={setNewTaskStartTime}
                                            triggerButton={
                                                <Button variant={"outline"} className={cn("flex justify-between items-center text-right font-normal w-full md:w-[300px]", !newTaskStartTime && "text-muted-foreground")}>
                                                    <span>{newTaskStartTime ? format(newTaskStartTime, "dd/MM/yyyy hh:mm a") : t('pickADateAndTime')}</span>
                                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-[1fr,auto] items-center gap-x-4">
                                <DateTimePicker
                                    date={newTaskReminder}
                                    onSave={setNewTaskReminder}
                                    onSelectDefault={() => setNewTaskReminder(calculateDefaultReminder())}
                                    triggerButton={
                                        <Button variant={"outline"} className={cn("flex justify-between items-center text-right font-normal w-full", !newTaskReminder && "text-muted-foreground")}>
                                            <span>{newTaskReminder ? format(newTaskReminder, "dd/MM/yyyy hh:mm a") : t('pickADateAndTime')}</span>
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    }
                                />
                                <Label className="whitespace-nowrap">{t('reminderLabel')} ({t('optional')})</Label>
                            </div>
                            <Button onClick={handleAddTask} className="w-full !mt-8" size="lg"><PlusCircle className="ml-2 h-4 w-4" /> {isEditMode ? t('saveChanges') : t('addTaskButton')}</Button>
                        </FormContentWrapper>
                    </TabsContent>

                    <TabsContent value="letter" className="mt-6">
                        <FormContentWrapper>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-[1fr,auto] items-center gap-x-4">
                                    <Input id="letter-name" placeholder={t('letterNamePlaceholder')} value={newLetterName} onChange={e => setNewLetterName(e.target.value)} dir="rtl" />
                                    <Label htmlFor="letter-name" className="whitespace-nowrap">{t('letterNameLabel')}</Label>
                                </div>
                                <div className="grid grid-cols-[1fr,auto] items-center gap-x-4">
                                    <Input id="letter-code" placeholder={t('letterCodePlaceholder')} value={newLetterCode} onChange={e => setNewLetterCode(e.target.value)} dir="rtl" />
                                    <Label htmlFor="letter-code" className="whitespace-nowrap">{t('letterCodeLabel')}</Label>
                                </div>
                            </div>
                            <div className="grid grid-cols-[1fr,auto] items-start gap-x-4">
                                <Textarea id="letter-detail" className="flex-grow" placeholder={t('letterDetailPlaceholder')} value={newLetterDetail} onChange={e => setNewLetterDetail(e.target.value)} rows={21} dir="rtl" />
                                <Label htmlFor="letter-detail" className="whitespace-nowrap pt-2">{t('letterDetailLabel')}</Label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-[1fr,auto] items-center gap-x-4">
                                    <Select onValueChange={setNewLetterSentTo} value={newLetterSentTo}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('sentToPlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>{t('departments')}</SelectLabel>
                                                {departmentOptions.map((o) => (
                                                    <SelectItem key={o} value={o}>{t(o)}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                            <SelectSeparator />
                                            <SelectGroup>
                                                <SelectLabel>{t('sentTo_office_group_label')}</SelectLabel>
                                                {officeOptions.map((o) => (
                                                    <SelectItem key={o} value={o}>{t(o)}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <Label className="whitespace-nowrap">{t('sentToPlaceholder')}</Label>
                                </div>
                                <div className="grid grid-cols-[1fr,auto] items-center gap-x-4">
                                    <Select onValueChange={setNewLetterLetterType} value={newLetterLetterType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('letterTypePlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {letterTypeOptions.map((o) => (
                                                <SelectItem key={o} value={o}>{t(o)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Label className="whitespace-nowrap">{t('letterTypePlaceholder')}</Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-[1fr,auto] items-center gap-x-4">
                                    <Select value={String(newLetterPriority)} onValueChange={(v) => setNewLetterPriority(Number(v))}>
                                        <SelectTrigger><SelectValue placeholder={t('selectPriority')} /></SelectTrigger>
                                        <SelectContent>{priorityOptions.map(p => <SelectItem key={p.value} value={String(p.value)}>{p.value} - {t(p.labelKey)}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Label className="whitespace-nowrap">{t('priorityLabel')}</Label>
                                </div>
                                <div className="flex items-center justify-end gap-x-2">
                                    <Switch id="new-letter-urgent-dialog" checked={newLetterIsUrgent} onCheckedChange={setNewLetterIsUrgent} />
                                    <Label htmlFor="new-letter-urgent-dialog" className="text-destructive font-semibold">{t('urgent')}</Label>
                                </div>
                            </div>

                            {/* Start Time Section */}
                            <div className="space-y-3 border p-4 rounded-lg bg-muted/30">
                                <Label className="text-base font-semibold block mb-2">{t('startTimeLabel')}</Label>
                                <RadioGroup value={useCurrentTimeLetter ? 'current' : 'custom'} onValueChange={(v) => setUseCurrentTimeLetter(v === 'current')} className="flex flex-col gap-2">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value="current" id="letter-current-time" />
                                        <Label htmlFor="letter-current-time" className="cursor-pointer">{t('useCurrentTime')} ({t('currentTime')}: {format(new Date(), 'p')})</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value="custom" id="letter-custom-time" />
                                        <Label htmlFor="letter-custom-time" className="cursor-pointer">{t('useCustomTime')}</Label>
                                    </div>
                                </RadioGroup>

                                {!useCurrentTimeLetter && (
                                    <div className="mr-8 mt-2 animate-in fade-in slide-in-from-top-2">
                                        <DateTimePicker
                                            date={newLetterStartTime}
                                            onSave={setNewLetterStartTime}
                                            triggerButton={
                                                <Button variant={"outline"} className={cn("flex justify-between items-center text-right font-normal w-full md:w-[300px]", !newLetterStartTime && "text-muted-foreground")}>
                                                    <span>{newLetterStartTime ? format(newLetterStartTime, "dd/MM/yyyy hh:mm a") : t('pickADateAndTime')}</span>
                                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-[1fr,auto] items-center gap-x-4">
                                <DateTimePicker
                                    date={newLetterReminder}
                                    onSave={setNewLetterReminder}
                                    onSelectDefault={() => setNewLetterReminder(calculateDefaultReminder())}
                                    triggerButton={
                                        <Button variant={"outline"} className={cn("flex justify-between items-center text-right font-normal w-full", !newLetterReminder && "text-muted-foreground")}>
                                            <span>{newLetterReminder ? format(newLetterReminder, "dd/MM/yyyy hh:mm a") : t('pickADateAndTime')}</span>
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    }
                                />
                                <Label className="whitespace-nowrap">{t('reminderLabel')} ({t('optional')})</Label>
                            </div>
                            <Button onClick={handleAddLetter} className="w-full !mt-8" size="lg"><PlusCircle className="ml-2 h-4 w-4" /> {isEditMode ? t('saveChanges') : t('addLetterButton')}</Button>
                        </FormContentWrapper>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

