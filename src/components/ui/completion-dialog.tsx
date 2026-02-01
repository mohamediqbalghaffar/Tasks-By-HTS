import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

    const handleConfirm = () => {
        onConfirm(new Date(date));
        onOpenChange(false);
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
                        <Label htmlFor="completion-date">{t('completionDate') || 'Completion Date'}</Label>
                        <Input
                            id="completion-date"
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
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
