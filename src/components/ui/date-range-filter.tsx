import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
    fromDate: Date | null;
    toDate: Date | null;
    onFromDateChange: (date: Date | null) => void;
    onToDateChange: (date: Date | null) => void;
    onPresetSelect: (preset: 'last7Days' | 'last30Days' | 'last3Months' | 'allTime') => void;
    onClear: () => void;
    t: (key: string) => string;
    getDateFnsLocale: () => any;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
    onPresetSelect,
    onClear,
    t,
    getDateFnsLocale
}) => {
    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{t('dateRangeFilter')}</h3>
                        {(fromDate || toDate) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClear}
                                className="h-8 text-xs"
                            >
                                <X className="h-3 w-3 ml-1" />
                                {t('clearFilter')}
                            </Button>
                        )}
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex flex-wrap gap-2" dir="rtl">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPresetSelect('last7Days')}
                            className="text-xs"
                        >
                            {t('last7Days')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPresetSelect('last30Days')}
                            className="text-xs"
                        >
                            {t('last30Days')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPresetSelect('last3Months')}
                            className="text-xs"
                        >
                            {t('last3Months')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPresetSelect('allTime')}
                            className="text-xs"
                        >
                            {t('allTime')}
                        </Button>
                    </div>

                    {/* Date Pickers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                        {/* From Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('fromDate')}</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-right font-normal",
                                            !fromDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="ml-2 h-4 w-4" />
                                        {fromDate ? format(fromDate, 'PPP', { locale: getDateFnsLocale() }) : t('pickADate')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={fromDate || undefined}
                                        onSelect={(date) => onFromDateChange(date || null)}
                                        initialFocus
                                        locale={getDateFnsLocale()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* To Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('toDate')}</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-right font-normal",
                                            !toDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="ml-2 h-4 w-4" />
                                        {toDate ? format(toDate, 'PPP', { locale: getDateFnsLocale() }) : t('pickADate')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={toDate || undefined}
                                        onSelect={(date) => onToDateChange(date || null)}
                                        initialFocus
                                        locale={getDateFnsLocale()}
                                        disabled={(date) => fromDate ? date < fromDate : false}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
