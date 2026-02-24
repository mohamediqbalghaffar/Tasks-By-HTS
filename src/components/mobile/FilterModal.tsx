'use client';

import * as React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
    onReset: () => void;

    // Filter states
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    filterStatus: string[];
    setFilterStatus: (value: string[]) => void;
    filterPriorities: number[];
    setFilterPriorities: (value: number[]) => void;
    filterDatePreset: string;
    setFilterDatePreset: (value: string) => void;
    sortOption: string;
    setSortOption: (value: string) => void;

    // Tab-specific filters
    isSharedView: boolean;
    activeTab: 'tasks' | 'letters';
    filterDepartments?: string[];
    setFilterDepartments?: (value: string[]) => void;
    filterLetterTypes?: string[];
    setFilterLetterTypes?: (value: string[]) => void;

    // Shared-specific filters
    filterSharedType?: string[];
    setFilterSharedType?: (value: string[]) => void;
    filterSharedUser?: string;
    setFilterSharedUser?: (value: string) => void;
    uniqueSenders?: string[];

    t: (key: string) => string;
    activeFiltersCount: number;
}

export function FilterModal({
    isOpen,
    onClose,
    onApply,
    onReset,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterPriorities,
    setFilterPriorities,
    filterDatePreset,
    setFilterDatePreset,
    sortOption,
    setSortOption,
    activeTab,
    isSharedView,
    filterDepartments = [],
    setFilterDepartments,
    filterLetterTypes = [],
    setFilterLetterTypes,
    filterSharedType = [],
    setFilterSharedType,
    filterSharedUser = '',
    setFilterSharedUser,
    uniqueSenders = [],
    t,
    activeFiltersCount
}: FilterModalProps) {

    const priorityOptions = Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        labelKey: `priority${i + 1}`
    }));

    const departmentOptions = [
        'sentTo_chairman', 'sentTo_ceo', 'sentTo_hr', 'sentTo_accounting',
        'sentTo_supply_chain', 'sentTo_equipment', 'sentTo_office_slemani',
        'sentTo_office_kirkuk', 'sentTo_office_diyala'
    ];

    const letterTypeOptions = [
        'letterType_general', 'letterType_termination', 'letterType_service_extension',
        'letterType_candidacy', 'letterType_position_change', 'letterType_commencement',
        'letterType_confirmation', 'letterType_leave', 'letterType_material_request',
        'letterType_material_return'
    ];

    const handleApply = () => {
        onApply();
        onClose();
    };

    const handleReset = () => {
        onReset();
        onClose();
    };

    if (!isOpen) return null;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            {/* Enhanced Backdrop with deeper blur and darker tint */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal - Modern Glassmorphism */}
            <div className={cn(
                "relative w-full max-w-lg glass-card border-x-0 sm:border-x border-b-0 sm:border-b border-t sm:rounded-3xl rounded-t-[2.5rem] shadow-2xl transition-all duration-500",
                "backdrop-blur-3xl bg-white/5 dark:bg-black/30",
                "animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 flex flex-col max-h-[92vh] mb-0 sm:mb-4 overflow-hidden"
            )}>
                {/* Header - Glassy Sub-section */}
                <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0 bg-white/5 dark:bg-black/20 backdrop-blur-lg">
                    <h2 className="text-xl font-bold tracking-tight">{t('filterAndSort')}</h2>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 dark:bg-black/20 active:scale-90 transition-all border border-white/10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="space-y-6 p-4">
                        {/* Search */}
                        <div className="space-y-3">
                            <Label htmlFor="mobile-search" className="text-sm font-semibold px-1">{t('searchPlaceholder')}</Label>
                            <Input
                                id="mobile-search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('searchPlaceholder')}
                                className="h-12 glass-input rounded-2xl border-white/10 focus:ring-primary/30"
                            />
                        </div>

                        <Separator className="bg-white/5" />

                        {/* Status */}
                        <div>
                            <Label className="text-base font-semibold block mb-3">{t('status')}</Label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <Checkbox
                                        id="mobile-status-active"
                                        checked={filterStatus.includes('active')}
                                        onCheckedChange={(checked) =>
                                            setFilterStatus(
                                                checked
                                                    ? [...filterStatus, 'active']
                                                    : filterStatus.filter(s => s !== 'active')
                                            )
                                        }
                                        className="h-5 w-5"
                                    />
                                    <Label htmlFor="mobile-status-active" className="font-normal text-base py-1 flex-1">
                                        {t('active')}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <Checkbox
                                        id="mobile-status-expired"
                                        checked={filterStatus.includes('expired')}
                                        onCheckedChange={(checked) =>
                                            setFilterStatus(
                                                checked
                                                    ? [...filterStatus, 'expired']
                                                    : filterStatus.filter(s => s !== 'expired')
                                            )
                                        }
                                        className="h-5 w-5"
                                    />
                                    <Label htmlFor="mobile-status-expired" className="font-normal text-base py-1 flex-1">
                                        {t('expired')}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <Checkbox
                                        id="mobile-status-completed"
                                        checked={filterStatus.includes('completed')}
                                        onCheckedChange={(checked) =>
                                            setFilterStatus(
                                                checked
                                                    ? [...filterStatus, 'completed']
                                                    : filterStatus.filter(s => s !== 'completed')
                                            )
                                        }
                                        className="h-5 w-5"
                                    />
                                    <Label htmlFor="mobile-status-completed" className="font-normal text-base py-1 flex-1">
                                        {t('filterCompleted')}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <Checkbox
                                        id="mobile-status-shared"
                                        checked={filterStatus.includes('shared')}
                                        onCheckedChange={(checked) =>
                                            setFilterStatus(
                                                checked
                                                    ? [...filterStatus, 'shared']
                                                    : filterStatus.filter(s => s !== 'shared')
                                            )
                                        }
                                        className="h-5 w-5"
                                    />
                                    <Label htmlFor="mobile-status-shared" className="font-normal text-base py-1 flex-1">
                                        {t('shared')}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Priority */}
                        <div>
                            <Label className="text-base font-semibold block mb-3">{t('priority')}</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {priorityOptions.map(opt => (
                                    <div key={opt.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <Checkbox
                                            id={`mobile-priority-${opt.value}`}
                                            checked={filterPriorities.includes(opt.value)}
                                            onCheckedChange={(checked) =>
                                                setFilterPriorities(
                                                    checked
                                                        ? [...filterPriorities, opt.value]
                                                        : filterPriorities.filter(p => p !== opt.value)
                                                )
                                            }
                                            className="h-5 w-5"
                                        />
                                        <Label htmlFor={`mobile-priority-${opt.value}`} className="font-normal text-base py-1 flex-1">
                                            {opt.value}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Date Range */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold px-1">{t('dateRange')}</Label>
                            <Select value={filterDatePreset} onValueChange={setFilterDatePreset}>
                                <SelectTrigger className="w-full h-12 glass-input rounded-2xl border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-card backdrop-blur-3xl">
                                    <SelectItem value="all">{t('all')}</SelectItem>
                                    <SelectItem value="today">{t('today')}</SelectItem>
                                    <SelectItem value="thisWeek">{t('thisWeek')}</SelectItem>
                                    <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Shared-specific filters */}
                        {isSharedView && setFilterSharedType && (
                            <>
                                <Separator />
                                <div>
                                    <Label className="text-base font-semibold block mb-3">{t('sharedType') || "جۆری هاوبەش"}</Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                            <Checkbox
                                                id="mobile-shared-received"
                                                checked={filterSharedType.includes('received')}
                                                onCheckedChange={(checked) =>
                                                    setFilterSharedType(
                                                        checked
                                                            ? [...filterSharedType, 'received']
                                                            : filterSharedType.filter(s => s !== 'received')
                                                    )
                                                }
                                                className="h-5 w-5"
                                            />
                                            <Label htmlFor="mobile-shared-received" className="font-normal text-base py-1 flex-1">
                                                {t('received') || "هاتوو"}
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                            <Checkbox
                                                id="mobile-shared-sent"
                                                checked={filterSharedType.includes('sent')}
                                                onCheckedChange={(checked) =>
                                                    setFilterSharedType(
                                                        checked
                                                            ? [...filterSharedType, 'sent']
                                                            : filterSharedType.filter(s => s !== 'sent')
                                                    )
                                                }
                                                className="h-5 w-5"
                                            />
                                            <Label htmlFor="mobile-shared-sent" className="font-normal text-base py-1 flex-1">
                                                {t('sent') || "نێردراو"}
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {setFilterSharedUser && uniqueSenders.length > 0 && (
                                    <>
                                        <Separator className="mt-6" />
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold block">{t('receivedBy') || "نێردراون لەلایەن"}</Label>
                                            <Select value={filterSharedUser} onValueChange={setFilterSharedUser}>
                                                <SelectTrigger className="w-full h-11">
                                                    <SelectValue placeholder={t('allUsers') || "هەموو بەکارهێنەران"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all_users">{t('allUsers') || "هەموو بەکارهێنەران"}</SelectItem>
                                                    {uniqueSenders.map(sender => (
                                                        <SelectItem key={sender} value={sender}>{sender}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Letter-specific filters */}
                        {(activeTab === 'letters') && setFilterDepartments && setFilterLetterTypes && (
                            <>
                                <Separator />

                                {/* Departments */}
                                <div>
                                    <Label className="text-base font-semibold block mb-3">{t('departments')}</Label>
                                    <div className="space-y-2">
                                        {departmentOptions.map(dept => (
                                            <div key={dept} className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <Checkbox
                                                    id={`mobile-dept-${dept}`}
                                                    checked={filterDepartments.includes(dept)}
                                                    onCheckedChange={(checked) =>
                                                        setFilterDepartments(
                                                            checked
                                                                ? [...filterDepartments, dept]
                                                                : filterDepartments.filter(d => d !== dept)
                                                        )
                                                    }
                                                    className="h-5 w-5"
                                                />
                                                <Label htmlFor={`mobile-dept-${dept}`} className="font-normal text-sm py-1 flex-1">
                                                    {t(dept)}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Letter Types */}
                                <div>
                                    <Label className="text-base font-semibold block mb-3">{t('letterType')}</Label>
                                    <div className="space-y-2">
                                        {letterTypeOptions.map(type => (
                                            <div key={type} className="flex items-center space-x-2 rtl:space-x-reverse">
                                                <Checkbox
                                                    id={`mobile-type-${type}`}
                                                    checked={filterLetterTypes.includes(type)}
                                                    onCheckedChange={(checked) =>
                                                        setFilterLetterTypes(
                                                            checked
                                                                ? [...filterLetterTypes, type]
                                                                : filterLetterTypes.filter(t => t !== type)
                                                        )
                                                    }
                                                    className="h-5 w-5"
                                                />
                                                <Label htmlFor={`mobile-type-${type}`} className="font-normal text-sm py-1 flex-1">
                                                    {t(type)}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* Sort By */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">{t('sortBy')}</Label>
                            <Select value={sortOption} onValueChange={setSortOption}>
                                <SelectTrigger className="w-full h-11">
                                    <SelectValue />
                                </SelectTrigger>
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

                {/* Footer - Glassy Sub-section with premium buttons */}
                <div className="border-t border-white/10 p-5 pb-8 sm:pb-5 flex gap-3 shrink-0 bg-white/5 dark:bg-black/40 backdrop-blur-xl">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="flex-1 h-14 rounded-2xl bg-white/5 dark:bg-black/20 hover:bg-white/10 dark:hover:bg-white/5 border border-white/10 transition-all"
                        disabled={activeFiltersCount === 0}
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {t('resetFilters')}
                    </Button>
                    <Button
                        onClick={handleApply}
                        className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all font-bold active:scale-95"
                    >
                        {t('apply')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
