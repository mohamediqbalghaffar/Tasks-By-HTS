
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { ApprovalLetter } from '@/contexts/LanguageContext';

interface LetterNumberEditorProps {
    item: ApprovalLetter;
    onSave: (id: string, field: string, value: any, type: 'letter') => void;
    t: (key: string) => string;
}

export function LetterNumberEditor({ item, onSave, t }: LetterNumberEditorProps) {
    const [open, setOpen] = React.useState(false);
    const [code, setCode] = React.useState(item.letterCode || '');

    React.useEffect(() => {
        if (open) {
            setCode(item.letterCode || '');
        }
    }, [open, item.letterCode]);

    const handleSave = () => {
        if (code !== item.letterCode) onSave(item.id, 'letterCode', code, 'letter');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                    <Edit className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('editLetterInfo')}</DialogTitle>
                    <DialogDescription>{item.name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('letterCode') || 'Letter Code'}</Label>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>{t('cancel')}</Button>
                    <Button onClick={handleSave}>{t('saveChanges')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
