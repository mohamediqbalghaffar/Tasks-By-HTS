
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CompletionDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (date: Date) => void;
    t: (key: string) => string;
}

export const CompletionDialog = ({
    isOpen,
    onOpenChange,
    onConfirm,
    t
}: CompletionDialogProps) => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const handleConfirm = () => {
        if (date) {
            onConfirm(date);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('completeItem') || 'Complete Item'}</DialogTitle>
                    <DialogDescription>{t('selectCompletionDate') || 'Select the date and time when this item was completed.'}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>{t('completionDate') || 'Completion Date'}</Label>
                        <DateTimePicker
                            date={date}
                            onSave={(newDate) => setDate(newDate || new Date())}
                            triggerButton={
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "P") : <span>{t('selectCompletionDate')}</span>}
                                </Button>
                            }
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}>{t('cancel')}</Button>
                    <Button onClick={(e) => { e.stopPropagation(); handleConfirm(); }}>{t('confirm') || 'Confirm'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
