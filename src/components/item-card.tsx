import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from "@/lib/utils";
import { AlertTriangle, Trash2, Share2, Users } from 'lucide-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Task, ApprovalLetter } from '@/contexts/LanguageContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompletionDialog } from '@/components/ui/completion-dialog';
import { useToast } from "@/hooks/use-toast";

interface ItemCardProps {
    item: Task | ApprovalLetter;
    isSelected: boolean;
    onCardClick: (item: Task | ApprovalLetter) => void;
    toggleIsDone: (id: string, type: 'task' | 'letter', date?: Date) => void;
    handleDelete: (id: string, type: 'task' | 'letter') => void;
    t: (key: string) => string;
    getDateFnsLocale: () => any;
    shareItem: (item: Task | ApprovalLetter, code: number, force?: boolean) => Promise<'success' | 'already_shared' | 'user_not_found' | 'error'>;
}

export const ShareDialog = ({ item, onShare, t }: { item: Task | ApprovalLetter, onShare: (item: any, code: number, force?: boolean) => Promise<'success' | 'already_shared' | 'user_not_found' | 'error'>, t: any }) => {
    const [code, setCode] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingCode, setPendingCode] = useState<number | null>(null);

    const handleShare = async (force: boolean = false) => {
        const num = pendingCode || parseInt(code);
        if (!isNaN(num)) {
            setIsLoading(true);
            const result = await onShare(item, num, force);
            setIsLoading(false);

            if (result === 'success') {
                setIsOpen(false);
                setCode('');
                setPendingCode(null);
                setShowConfirm(false);
            } else if (result === 'already_shared') {
                setPendingCode(num);
                setShowConfirm(true);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setShowConfirm(false); setPendingCode(null); } }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>
                    <Share2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-md">
                {!showConfirm ? (
                    <>
                        <DialogHeader>
                            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Share2 className="h-6 w-6 text-primary" />
                            </div>
                            <DialogTitle className="text-center text-xl">{t('share')}</DialogTitle>
                            <DialogDescription className="text-center">{t('shareItemDesc')}</DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="share-code" className="text-sm font-medium">{t('shareCode')}</Label>
                                <div className="relative">
                                    <Input
                                        id="share-code"
                                        type="number"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        placeholder="e.g. 12345"
                                        className="pl-10 text-lg tracking-wide"
                                        autoFocus
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{t('shareCodeHint')}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>{t('cancel')}</Button>
                            <Button
                                onClick={() => handleShare(false)}
                                className="w-full"
                                disabled={!code || isLoading}
                            >
                                {isLoading ? (
                                    <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                    <Share2 className="mr-2 h-4 w-4" />
                                )}
                                {t('share')}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <DialogTitle className="text-center text-xl">{t('alreadySharedTitle') || 'Already Shared'}</DialogTitle>
                            <DialogDescription className="text-center">
                                {t('alreadySharedDesc') || 'This item has already been shared with this user. Do you want to share it again?'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" className="w-full" onClick={() => { setShowConfirm(false); setPendingCode(null); }}>{t('cancel')}</Button>
                            <Button
                                onClick={() => handleShare(true)}
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                    <Share2 className="mr-2 h-4 w-4" />
                                )}
                                {t('shareAgain') || 'Share Again'}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

// Define the component first
const ItemCardComponent: React.FC<ItemCardProps> = ({
    item,
    isSelected,
    onCardClick,
    toggleIsDone,
    handleDelete,
    t,
    getDateFnsLocale,
    shareItem
}) => {
    const isTask = 'taskNumber' in item;
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const { toast } = useToast();

    const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast({
            title: t('copied') || "Copied",
            description: `${label} ${t('copiedToClipboard') || "copied to clipboard"}`,
            duration: 2000,
        });
    };

    const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setShowCompletionDialog(true);
        } else {
            toggleIsDone(item.id, isTask ? 'task' : 'letter');
        }
    };


    return (
        <Card
            onClick={() => onCardClick(item)}
            className={cn(
                "cursor-pointer transition-all hover:bg-muted/80 relative group",
                isSelected ? "bg-muted border-primary" : "bg-card",
                item.isUrgent && !item.isDone && "urgent-pulse-glow",
                item.reminder && !item.isDone && new Date(item.reminder) < new Date() && "expired-pulse-glow"
            )}
        >
            {isTask ? (
                <CardContent className="p-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-grow min-w-0">
                        <Checkbox
                            checked={item.isDone}
                            onCheckedChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 rounded-md mt-1"
                        />
                        <div className="flex-grow space-y-0.5 text-right min-w-0">
                            <div className="flex justify-end items-center gap-2">
                                {/* Shared Indicator */}
                                {item.sharedCount && item.sharedCount > 0 ? (
                                    <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0" title={t('sharedTimes') + ': ' + item.sharedCount}>
                                        <Users className="h-3 w-3" />
                                        <span>{item.sharedCount}</span>
                                    </div>
                                ) : null}
                                {item.isUrgent && !item.isDone && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                                <p
                                    className="font-semibold break-words text-sm truncate hover:text-foreground cursor-copy transition-colors"
                                    onClick={(e) => handleCopy(e, item.name, t('itemName') || "Item Name")}
                                    title={t('clickToCopy') || "Click to copy"}
                                >
                                    {item.name}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground break-words truncate pr-1" title={item.detail}>{item.detail}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('confirmDeleteTaskDescription')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id, 'task');
                                        }}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        {t('confirmDelete')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <ShareDialog item={item} onShare={shareItem} t={t} />
                        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0 pt-1">
                            <span>{format(item.createdAt, 'dd/MM/yy HH:mm')}</span>
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                {formatDistanceToNowStrict(item.createdAt, { locale: getDateFnsLocale(), addSuffix: true })}
                            </span>
                        </div>
                    </div>
                    <CompletionDialog
                        isOpen={showCompletionDialog}
                        onOpenChange={setShowCompletionDialog}
                        onConfirm={(date) => toggleIsDone(item.id, isTask ? 'task' : 'letter', date)}
                        t={t}
                    />
                </CardContent>
            ) : (
                <CardContent className="p-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-grow min-w-0">
                        <Checkbox
                            checked={item.isDone}
                            onCheckedChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 rounded-md mt-1"
                        />
                        <div className="flex-grow space-y-1 text-right min-w-0">
                            <div className="flex justify-end items-center gap-2">
                                {/* Shared Indicator */}
                                {item.sharedCount && item.sharedCount > 0 ? (
                                    <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0" title={t('sharedTimes') + ': ' + item.sharedCount}>
                                        <Users className="h-3 w-3" />
                                        <span>{item.sharedCount}</span>
                                    </div>
                                ) : null}
                                {item.isUrgent && !item.isDone && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                                <p
                                    className="font-semibold break-words text-sm truncate hover:text-foreground cursor-copy transition-colors"
                                    onClick={(e) => handleCopy(e, item.name, t('itemName') || "Item Name")}
                                    title={t('clickToCopy') || "Click to copy"}
                                >
                                    {item.name}
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-x-2 text-xs text-muted-foreground pr-1">
                                <span className="truncate">{t((item as ApprovalLetter).sentTo) || (item as ApprovalLetter).sentTo}</span>
                                <span className="shrink-0">•</span>
                                <span className="truncate">{t((item as ApprovalLetter).letterType) || (item as ApprovalLetter).letterType}</span>
                                <span className="shrink-0">•</span>
                                <span
                                    className="font-mono shrink-0 hover:text-foreground cursor-copy transition-colors"
                                    onClick={(e) => handleCopy(e, ((item as ApprovalLetter).letterCode || (item as ApprovalLetter).letterNumber).toString(), t('letterCode') || "Letter Code")}
                                    title={t('clickToCopy') || "Click to copy"}
                                >
                                    #{(item as ApprovalLetter).letterCode || (item as ApprovalLetter).letterNumber}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('confirmDeleteLetterDescription')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id, 'letter');
                                        }}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        {t('confirmDelete')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <ShareDialog item={item} onShare={shareItem} t={t} />
                        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0 pt-1">
                            <span>{format(item.createdAt, 'dd/MM/yy HH:mm')}</span>
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                {formatDistanceToNowStrict(item.createdAt, { locale: getDateFnsLocale(), addSuffix: true })}
                            </span>
                        </div>
                    </div>
                    <CompletionDialog
                        isOpen={showCompletionDialog}
                        onOpenChange={setShowCompletionDialog}
                        onConfirm={(date) => toggleIsDone(item.id, isTask ? 'task' : 'letter', date)}
                        t={t}
                    />
                </CardContent>
            )}
        </Card>
    );
};

// Memoized ItemCard to prevent unnecessary re-renders
export const ItemCard = React.memo<ItemCardProps>(ItemCardComponent, (prevProps, nextProps) => {
    // Custom comparison function - only re-render if these props change
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.isDone === nextProps.item.isDone &&
        prevProps.item.isUrgent === nextProps.item.isUrgent &&
        prevProps.item.priority === nextProps.item.priority &&
        prevProps.item.name === nextProps.item.name &&
        prevProps.item.detail === nextProps.item.detail &&
        prevProps.item.updatedAt.getTime() === nextProps.item.updatedAt.getTime() &&
        prevProps.isSelected === nextProps.isSelected
    );
});

ItemCard.displayName = 'ItemCard';
