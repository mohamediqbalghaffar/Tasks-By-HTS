
'use client';

import * as React from 'react';
import LoadingAnimation from '@/components/ui/loading-animation';
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { TaskCard } from '@/components/mobile/TaskCard';
import { LetterCard } from '@/components/mobile/LetterCard';
import { FilterModal } from '@/components/mobile/FilterModal';
import { useTask } from '@/contexts/TaskContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from "@/lib/utils";
import { ListTodo, FileText, PanelRight, PanelLeft, AlertTriangle, ChevronsLeft, Trash2, Upload, Download, FileSpreadsheet, Filter, X as XIcon, CalendarIcon, Edit, ChevronDown, Share2 } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isAfter, isBefore, isWithinInterval, formatDistanceToNowStrict } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Task, ApprovalLetter } from '@/contexts/LanguageContext';
import { renderDetailContent } from '@/lib/render-detail-content';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WheelDatePicker } from '@/components/ui/wheel-date-picker';
import { ItemCard, ShareDialog } from '@/components/item-card';


// New Memoized ItemCard component



export default function Home() {
    // Contexts
    const { t, getDateFnsLocale } = useLanguage();
    const {
        tasks,
        approvalLetters,
        isInitialDataLoading,
        isMounted,
        expiredTasksList,
        expiredApprovalLettersList,
        toggleIsDone,
        handleDelete,
        shareItem,
        handleExportToExcel,
        handleImportFromExcel,
        handleDownloadExcelTemplate,
        handleBulkDelete,
        handlePriorityChange,
        handleReminderChange,
        handleUrgencyChange,
        calculateDefaultReminder,
        handleDateChange,
        handleSaveField
    } = useTask();

    const {
        showTasks,
        setShowTasks,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        filterLetterTypes,
        setFilterLetterTypes,
        filterDepartments,
        setFilterDepartments,
        filterPriorities,
        setFilterPriorities,
        filterDatePreset,
        setFilterDatePreset,
        filterCustomDateFrom,
        setFilterCustomDateFrom,
        filterCustomDateTo,
        setFilterCustomDateTo,
        sortOption,
        setSortOption,
        resetFilters,
        handleOpenEditField,
        viewMode
    } = useUI();

    const { currentUser } = useAuth(); // If needed

    const actions = useMemo(() => ({
        handlePriorityChange,
        handleReminderChange,
        handleUrgencyChange,
        handleOpenEditField,
        handleDelete,
        calculateDefaultReminder,
        handleDateChange,
        handleSaveField
    }), [handlePriorityChange, handleReminderChange, handleUrgencyChange, handleOpenEditField, handleDelete, calculateDefaultReminder, handleDateChange, handleSaveField]);

    const router = useRouter();
    const [selectedItem, setSelectedItem] = useState<Task | ApprovalLetter | null>(null);
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const importInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const onImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImportFromExcel(file);
        }
        e.target.value = ''; // Reset input to allow importing the same file again
    };


    useEffect(() => {
        // When switching between task/letter view, if the selected item is no longer
        // in the visible list, clear the selection.
        if (selectedItem) {
            const isTask = 'taskNumber' in selectedItem;
            if ((showTasks && !isTask) || (!showTasks && isTask)) {
                setSelectedItem(null);
                setIsDetailViewOpen(false);
            }
        }
    }, [showTasks, selectedItem]);


    const handleCardClick = (item: Task | ApprovalLetter) => {
        setSelectedItem(item);
        // Automatically open the detail view when an item is selected
        if (!isDetailViewOpen) {
            setIsDetailViewOpen(true);
        }
    };

    const departmentOptions = ['sentTo_chairman', 'sentTo_ceo', 'sentTo_hr', 'sentTo_accounting', 'sentTo_supply_chain', 'sentTo_equipment', 'sentTo_office_slemani', 'sentTo_office_kirkuk', 'sentTo_office_diyala'];
    const letterTypeOptions = ['letterType_general', 'letterType_termination', 'letterType_service_extension', 'letterType_candidacy', 'letterType_position_change', 'letterType_commencement', 'letterType_confirmation', 'letterType_leave', 'letterType_material_request', 'letterType_material_return'];
    const priorityOptions: { value: number, labelKey: string }[] = Array.from({ length: 10 }, (_, i) => ({ value: i + 1, labelKey: `priority${i + 1}` }));


    const itemsToDisplay = useMemo(() => {
        let baseItems: (Task | ApprovalLetter)[];
        if (showTasks) {
            let items: Task[] = [];
            if (filterStatus.includes('active')) items.push(...tasks.filter(t => !t.isDone));
            if (filterStatus.includes('expired')) items.push(...expiredTasksList);
            if (filterStatus.includes('completed')) items.push(...tasks.filter(t => t.isDone));
            baseItems = items;
        } else {
            let items: ApprovalLetter[] = [];
            if (filterStatus.includes('active')) items.push(...approvalLetters.filter(l => !l.isDone));
            if (filterStatus.includes('expired')) items.push(...expiredApprovalLettersList);
            if (filterStatus.includes('completed')) items.push(...approvalLetters.filter(l => l.isDone));
            baseItems = items;
        }

        let filteredItems = baseItems.filter(item => {
            const searchMatch = searchQuery ?
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ('letterCode' in item && item.letterCode?.toLowerCase().includes(searchQuery.toLowerCase()))
                : true;

            const priorityMatch = filterPriorities.length > 0 ? filterPriorities.includes(item.priority) : true;

            let letterMatch = true;
            if (!showTasks) {
                const letter = item as ApprovalLetter;
                const departmentMatch = filterDepartments.length > 0 ? filterDepartments.includes(letter.sentTo) : true;
                const letterTypeMatch = filterLetterTypes.length > 0 ? filterLetterTypes.includes(letter.letterType) : true;
                letterMatch = departmentMatch && letterTypeMatch;
            }

            let dateMatch = true;
            const itemDate = item.createdAt;
            if (filterDatePreset !== 'all' && itemDate) {
                let from: Date | null = null;
                let to: Date | null = null;
                const now = new Date();

                if (filterDatePreset === 'today') {
                    from = startOfDay(now);
                    to = endOfDay(now);
                } else if (filterDatePreset === 'thisWeek') {
                    from = startOfWeek(now, { locale: getDateFnsLocale() });
                    to = endOfWeek(now, { locale: getDateFnsLocale() });
                } else if (filterDatePreset === 'thisMonth') {
                    from = startOfMonth(now);
                    to = endOfMonth(now);
                } else if (filterDatePreset === 'custom' && (filterCustomDateFrom || filterCustomDateTo)) {
                    from = filterCustomDateFrom ? startOfDay(filterCustomDateFrom) : null;
                    to = filterCustomDateTo ? endOfDay(filterCustomDateTo) : null;
                }

                if (from && isBefore(itemDate, from)) dateMatch = false;
                if (to && isAfter(itemDate, to)) dateMatch = false;
            }

            return searchMatch && priorityMatch && letterMatch && dateMatch;
        });

        filteredItems.sort((a, b) => {
            switch (sortOption) {
                case 'createdAt_desc': return b.createdAt.getTime() - a.createdAt.getTime();
                case 'createdAt_asc': return a.createdAt.getTime() - b.createdAt.getTime();
                case 'priority_desc': return b.priority - a.priority;
                case 'priority_asc': return a.priority - b.priority;
                case 'name_asc': return a.name.localeCompare(b.name);
                case 'name_desc': return b.name.localeCompare(a.name);
                default: return b.createdAt.getTime() - a.createdAt.getTime();
            }
        });

        return filteredItems;
    }, [
        tasks, approvalLetters, expiredTasksList, expiredApprovalLettersList, showTasks,
        searchQuery, filterStatus, filterPriorities, filterDepartments, filterLetterTypes,
        filterDatePreset, filterCustomDateFrom, filterCustomDateTo, sortOption, getDateFnsLocale
    ]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        const defaultStatus = ['active', 'expired'];
        const isStatusDefault = filterStatus.length === defaultStatus.length && filterStatus.every(s => defaultStatus.includes(s));

        if (searchQuery) count++;
        if (!isStatusDefault) count++;
        if (!showTasks) {
            if (filterLetterTypes.length > 0) count++;
            if (filterDepartments.length > 0) count++;
        }
        if (filterPriorities.length > 0) count++;
        if (filterDatePreset !== 'all') count++;

        return count;
    }, [showTasks, searchQuery, filterStatus, filterLetterTypes, filterDepartments, filterPriorities, filterDatePreset]);

    const todaysItems = useMemo(() => {
        const now = new Date();
        const startOfToday = startOfDay(now);
        const endOfToday = endOfDay(now);

        const allItems = [...tasks, ...approvalLetters];
        return allItems.filter(item => isWithinInterval(item.createdAt, { start: startOfToday, end: endOfToday }));
    }, [tasks, approvalLetters]);


    if (!isMounted || isInitialDataLoading) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    // Mobile View - Completely different rendering
    if (viewMode === 'mobile') {
        return (
            <div className="h-full flex flex-col">
                {/* Mobile Search Bar */}
                <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="flex-1"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsFilterModalOpen(true)}
                        className="relative shrink-0"
                    >
                        <Filter className="h-5 w-5" />
                        {activeFiltersCount > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                                {activeFiltersCount}
                            </div>
                        )}
                    </Button>
                </div>

                {/* Mobile Tabs */}
                <div className="px-4 pb-3">
                    <div className="flex items-center bg-muted p-1 rounded-lg">
                        <Button
                            variant={showTasks ? "default" : "ghost"}
                            onClick={() => setShowTasks(true)}
                            className="flex-1 h-9 text-sm flex items-center justify-center gap-2"
                        >
                            <ListTodo className="h-4 w-4" /> {t('tasksTab')}
                        </Button>
                        <Button
                            variant={!showTasks ? "default" : "ghost"}
                            onClick={() => setShowTasks(false)}
                            className="flex-1 h-9 text-sm flex items-center justify-center gap-2"
                        >
                            <FileText className="h-4 w-4" /> {t('lettersTab')}
                        </Button>
                    </div>
                </div>

                {/* Mobile Item List */}
                <ScrollArea className="flex-1 px-4">
                    <div className="pb-4 space-y-3">
                        {itemsToDisplay.length > 0 ? itemsToDisplay.map(item => (
                            showTasks ? (
                                <TaskCard
                                    key={item.id}
                                    task={item as Task}
                                    onComplete={(task, date) => toggleIsDone(task.id, 'task', date)}
                                    onDelete={(task) => handleDelete(task.id, 'task')}
                                    onEdit={(task) => router.push(`/add?tab=task&edit=${task.id}`)}
                                    t={t}
                                    getDateFnsLocale={getDateFnsLocale}
                                />
                            ) : (
                                <LetterCard
                                    key={item.id}
                                    letter={item as ApprovalLetter}
                                    onComplete={(letter, date) => toggleIsDone(letter.id, 'letter', date)}
                                    onDelete={(letter) => handleDelete(letter.id, 'letter')}
                                    onEdit={(letter) => router.push(`/add?tab=letter&edit=${letter.id}`)}
                                    t={t}
                                    getDateFnsLocale={getDateFnsLocale}
                                />
                            )
                        )) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>{showTasks ? t('noActiveTasks') : t('noActiveLetters')}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Filter Modal */}
                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    onApply={() => setIsFilterModalOpen(false)}
                    onReset={resetFilters}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    filterPriorities={filterPriorities}
                    setFilterPriorities={setFilterPriorities}
                    filterDatePreset={filterDatePreset}
                    setFilterDatePreset={setFilterDatePreset}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    showTasks={showTasks}
                    filterDepartments={filterDepartments}
                    setFilterDepartments={setFilterDepartments}
                    filterLetterTypes={filterLetterTypes}
                    setFilterLetterTypes={setFilterLetterTypes}
                    t={t}
                    activeFiltersCount={activeFiltersCount}
                />
            </div>
        );
    }

    // Desktop View - Original layout

    const masterView = (
        <div className="flex flex-col h-full overflow-hidden p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all font-medium">
                                <FileSpreadsheet className="h-4 w-4 text-primary" />
                                {t('importExport')}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 p-2" align="end">
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 pb-2">{t('importExport')}</DropdownMenuLabel>

                            <DropdownMenuItem onClick={handleImportClick} className="cursor-pointer py-3 rounded-lg focus:bg-primary/5 focus:text-primary">
                                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 mr-3">
                                    <Upload className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">{t('importFromExcel')}</span>
                                    <span className="text-[10px] text-muted-foreground">{t('importFromExcelDesc') || "Upload .xlsx file"}</span>
                                </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={handleExportToExcel} className="cursor-pointer py-3 rounded-lg focus:bg-primary/5 focus:text-primary mt-1">
                                <div className="p-1.5 rounded-md bg-green-500/10 text-green-500 mr-3">
                                    <Download className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">{t('exportToExcel')}</span>
                                    <span className="text-[10px] text-muted-foreground">{t('exportToExcelDesc') || "Download data as .xlsx"}</span>
                                </div>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1" />

                            <DropdownMenuItem onClick={handleDownloadExcelTemplate} className="cursor-pointer py-3 rounded-lg focus:bg-primary/5 focus:text-primary">
                                <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500 mr-3">
                                    <FileSpreadsheet className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">{t('downloadExcelTemplate')}</span>
                                    <span className="text-[10px] text-muted-foreground">{t('downloadExcelTemplateDesc') || "Empty template for new data"}</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <input
                        type="file"
                        ref={importInputRef}
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                        onChange={onImportFileChange}
                    />

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="relative">
                                <Filter className="mr-2 h-4 w-4" />
                                {t('filters')}
                                {activeFiltersCount > 0 && (
                                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                                        {activeFiltersCount}
                                    </div>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 flex flex-col h-full">
                            <SheetHeader className="p-6 pb-4 text-left border-b shrink-0">
                                <SheetTitle>{t('filterAndSort')}</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="flex-grow">
                                <div className="p-6 space-y-6">
                                    {/* Search */}
                                    <div>
                                        <Label htmlFor="search-filter">{t('searchPlaceholder')}</Label>
                                        <Input id="search-filter" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('searchPlaceholder')} />
                                    </div>
                                    <Separator />
                                    {/* Status */}
                                    <div>
                                        <Label>{t('status')}</Label>
                                        <div className="space-y-2 mt-2">
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <Checkbox id="status-active" checked={filterStatus.includes('active')} onCheckedChange={(checked) => setFilterStatus(s => checked ? [...s, 'active'] : s.filter(i => i !== 'active'))} />
                                                <Label htmlFor="status-active" className="font-normal">{t('active')}</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <Checkbox id="status-expired" checked={filterStatus.includes('expired')} onCheckedChange={(checked) => setFilterStatus(s => checked ? [...s, 'expired'] : s.filter(i => i !== 'expired'))} />
                                                <Label htmlFor="status-expired" className="font-normal">{t('expired')}</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <Checkbox id="status-completed" checked={filterStatus.includes('completed')} onCheckedChange={(checked) => setFilterStatus(s => checked ? [...s, 'completed'] : s.filter(i => i !== 'completed'))} />
                                                <Label htmlFor="status-completed" className="font-normal">{t('filterCompleted')}</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    {/* Priority */}
                                    <div>
                                        <Label>{t('priority')}</Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="outline" className="w-full mt-2">{t('selectPriority')} ({filterPriorities.length})</Button></DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel>{t('priority')}</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {priorityOptions.map(opt => (
                                                    <DropdownMenuCheckboxItem key={opt.value} checked={filterPriorities.includes(opt.value)} onCheckedChange={(checked) => setFilterPriorities(p => checked ? [...p, opt.value] : p.filter(i => i !== opt.value))}>
                                                        {opt.value} - {t(opt.labelKey)}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <Separator />
                                    {/* Date Range */}
                                    <div>
                                        <Label>{t('dateRange')}</Label>
                                        <Select value={filterDatePreset} onValueChange={setFilterDatePreset}>
                                            <SelectTrigger className="w-full mt-2"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('all')}</SelectItem>
                                                <SelectItem value="today">{t('today')}</SelectItem>
                                                <SelectItem value="thisWeek">{t('thisWeek')}</SelectItem>
                                                <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
                                                <SelectItem value="custom">{t('custom')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {filterDatePreset === 'custom' && (
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="mb-1 block text-xs">{t('from')}</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !filterCustomDateFrom && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {filterCustomDateFrom ? format(filterCustomDateFrom, "dd/MM/yyyy") : <span>{t('pickADate')}</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <WheelDatePicker
                                                                date={filterCustomDateFrom}
                                                                setDate={setFilterCustomDateFrom as (date: Date) => void}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div>
                                                    <Label className="mb-1 block text-xs">{t('to')}</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !filterCustomDateTo && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {filterCustomDateTo ? format(filterCustomDateTo, "dd/MM/yyyy") : <span>{t('pickADate')}</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <WheelDatePicker
                                                                date={filterCustomDateTo}
                                                                setDate={setFilterCustomDateTo as (date: Date) => void}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Separator />
                                    {/* Letter-specific filters */}
                                    {!showTasks && (
                                        <>
                                            <div>
                                                <Label>{t('departments')}</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="outline" className="w-full mt-2">{t('departments')} ({filterDepartments.length})</Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56">
                                                        {departmentOptions.map(opt => (
                                                            <DropdownMenuCheckboxItem key={opt} checked={filterDepartments.includes(opt)} onCheckedChange={(checked) => setFilterDepartments(d => checked ? [...d, opt] : d.filter(i => i !== opt))}>
                                                                {t(opt)}
                                                            </DropdownMenuCheckboxItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <Separator />
                                            <div>
                                                <Label>{t('letterType')}</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="outline" className="w-full mt-2">{t('letterType')} ({filterLetterTypes.length})</Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56">
                                                        {letterTypeOptions.map(opt => (
                                                            <DropdownMenuCheckboxItem key={opt} checked={filterLetterTypes.includes(opt)} onCheckedChange={(checked) => setFilterLetterTypes(lt => checked ? [...lt, opt] : lt.filter(i => i !== opt))}>
                                                                {t(opt)}
                                                            </DropdownMenuCheckboxItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <Separator />
                                        </>
                                    )}
                                    {/* Sort By */}
                                    <div>
                                        <Label>{t('sortBy')}</Label>
                                        <Select value={sortOption} onValueChange={setSortOption}>
                                            <SelectTrigger className="w-full mt-2"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="createdAt_desc">{t('sort_createdAt_desc')}</SelectItem>
                                                <SelectItem value="createdAt_asc">{t('sort_createdAt_asc')}</SelectItem>
                                                <SelectItem value="priority_desc">{t('sort_priority_desc')}</SelectItem>
                                                <SelectItem value="priority_asc">{t('sort_priority_asc')}</SelectItem>
                                                <SelectItem value="name_asc">{t('sort_name_asc')}</SelectItem>
                                                <SelectItem value="name_desc">{t('sort_name_desc')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                {t('actions')} <ChevronDown className="mr-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={resetFilters} disabled={activeFiltersCount === 0}>
                                <XIcon className="ml-2 h-4 w-4" />
                                <span>{t('resetFilters')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground px-2">{t('bulkDelete')}</DropdownMenuLabel>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        disabled={activeFiltersCount === 0 || itemsToDisplay.length === 0}
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    >
                                        <Filter className="ml-2 h-4 w-4" />
                                        <span>
                                            {activeFiltersCount > 0 && itemsToDisplay.length > 0
                                                ? t('deleteFilteredItems', { count: itemsToDisplay.length })
                                                : t('selectFiltersToDelete')}
                                        </span>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('confirmBulkDeleteTitle')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('confirmBulkDeleteDescription', { count: itemsToDisplay.length, type: showTasks ? t('tasksTab') : t('lettersTab') })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleBulkDelete(itemsToDisplay)}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {t('confirmDelete')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        disabled={todaysItems.length === 0}
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    >
                                        <Upload className="ml-2 h-4 w-4" />
                                        <span>
                                            {t('deleteTodaysImports', { count: todaysItems.length })}
                                        </span>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('confirmDeleteTodaysImportsTitle')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('confirmDeleteTodaysImportsDesc', { count: todaysItems.length })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleBulkDelete(todaysItems)}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {t('confirmDelete')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center bg-muted p-1 rounded-lg">
                        <Button variant={showTasks ? "default" : "ghost"} onClick={() => setShowTasks(true)} className="px-3 py-1 h-8 text-sm flex items-center gap-2">
                            <ListTodo className="h-4 w-4" /> {t('tasksTab')}
                        </Button>
                        <Button variant={!showTasks ? "default" : "ghost"} onClick={() => setShowTasks(false)} className="px-3 py-1 h-8 text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4" /> {t('lettersTab')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Item List */}
            <ScrollArea className="flex-grow">
                <div className="space-y-3 pr-2">
                    {itemsToDisplay.length > 0 ? itemsToDisplay.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            isSelected={selectedItem?.id === item.id}
                            onCardClick={handleCardClick}
                            toggleIsDone={toggleIsDone}
                            handleDelete={handleDelete}
                            shareItem={shareItem}
                            t={t}
                            getDateFnsLocale={getDateFnsLocale}
                        />
                    )) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>{showTasks ? t('noActiveTasks') : t('noActiveLetters')}</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );

    const detailView = (
        <Card className="glass-card flex flex-col h-full">
            <CardHeader className="flex flex-row-reverse justify-between items-center shrink-0">
                {selectedItem ? (
                    <div className="flex items-center gap-3 flex-row-reverse">
                        <div className="bg-primary/20 text-primary p-2 rounded-full">
                            {'taskNumber' in selectedItem ? <ListTodo className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                        </div>
                        <div className="text-right">
                            <CardTitle className="text-base font-bold">{selectedItem.name}</CardTitle>
                            <CardDescription className="text-xs">
                            </CardDescription>
                        </div>
                        <ShareDialog item={selectedItem} onShare={shareItem} t={t} />
                    </div>
                ) : <div></div>}
                <Button variant="ghost" size="icon" onClick={() => setIsDetailViewOpen(false)}>
                    <ChevronsLeft className="h-5 w-5" />
                </Button>
            </CardHeader>
            <ScrollArea className="flex-grow">
                <CardContent className="pt-6">
                    {selectedItem ? (
                        renderDetailContent(selectedItem, actions, t, getDateFnsLocale)
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
                isDetailViewOpen ? 'grid-cols-[2fr_3fr]' : 'grid-cols-1'
            )}>
                <div className="flex flex-col min-h-0 h-full relative">
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
