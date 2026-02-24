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
import { SharedWithList } from '@/components/shared-with-list';
import { useToast } from "@/hooks/use-toast";

interface ItemCardProps {
    item: Task | ApprovalLetter;
    isSelected: boolean;
    onCardClick: (item: Task | ApprovalLetter) => void;
    toggleIsDone: (id: string, type: 'task' | 'letter', date?: Date) => void;
    handleDelete: (id: string, type: 'task' | 'letter') => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    getDateFnsLocale: () => any;
    shareItem: (item: Task | ApprovalLetter, code: number, force?: boolean) => Promise<'success' | 'already_shared' | 'user_not_found' | 'error'>;
    unshareItem?: (itemId: string, itemType: 'task' | 'letter', targetUserId: string) => Promise<boolean>;
}

export const ShareDialog = ({ item, onShare, onUnshare, t }: {
    item: Task | ApprovalLetter,
    onShare: (item: any, code: number, force?: boolean) => Promise<'success' | 'already_shared' | 'user_not_found' | 'error'>,
    onUnshare?: (itemId: string, itemType: 'task' | 'letter', targetUserId: string) => Promise<boolean>,
    t: any
}) => {
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

    const itemType = 'taskNumber' in item ? 'task' : 'letter';
    const hasShares = (item.sharedCount || 0) > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setShowConfirm(false); setPendingCode(null); } }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-primary hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>
                    <Share2 className="h-4 w-4" />
                    {hasShares && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                            {item.sharedCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-md">
                {!showConfirm ? (
                    <>
                        <DialogHeader>
                            <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                                <Share2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">{t('share')}</DialogTitle>
                            <DialogDescription className="text-center text-base text-gray-700 dark:text-gray-300">{t('shareItemDesc')}</DialogDescription>
                        </DialogHeader>

                        {/* Show shared users list if item has shares */}
                        {hasShares && onUnshare && (
                            <SharedWithList
                                itemId={item.id}
                                itemType={itemType}
                                onUnshare={onUnshare}
                            />
                        )}

                        <div className="py-6 space-y-4">
                            <div className="space-y-3">
                                <Label htmlFor="share-code" className="text-sm font-semibold text-gray-900 dark:text-white">{t('shareCode')}</Label>
                                <div className="relative">
                                    <Input
                                        id="share-code"
                                        type="number"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        placeholder={t('shareCodePlaceholder') || "بۆ نموونە ١٢٣٤٥"}
                                        className="pl-11 pr-4 h-12 text-lg font-medium tracking-wide border-2 border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        autoFocus
                                    />
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                        <Users className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('shareCodeHint') || "کۆدی هاوبەشکردنی ئەو کەسە بنووسە کە دەتەوێت بابەتەکەی لەگەڵ هاوبەش بکەیت"}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="w-full min-h-[44px] sm:min-h-[40px] text-base font-semibold border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                onClick={() => handleShare(false)}
                                className="w-full min-h-[44px] sm:min-h-[40px] text-base font-semibold bg-blue-600 dark:bg-blue-600 text-white dark:text-white border-0"
                                disabled={!code || isLoading}
                            >
                                {isLoading ? (
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
                            <div className="mx-auto w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-500 flex items-center justify-center mb-4">
                                <AlertTriangle className="h-7 w-7" />
                            </div>
                            <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">{t('alreadySharedTitle')}</DialogTitle>
                            <DialogDescription className="text-center text-base text-gray-700 dark:text-gray-300">
                                {t('alreadySharedDesc')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="w-full min-h-[44px] sm:min-h-[40px] text-base font-semibold border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                onClick={() => { setShowConfirm(false); setPendingCode(null); }}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                onClick={() => handleShare(true)}
                                className="w-full min-h-[44px] sm:min-h-[40px] text-base font-semibold bg-blue-600 dark:bg-blue-600 text-white dark:text-white border-0"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                    <Share2 className="mr-2 h-4 w-4" />
                                )}
                                {t('shareAgain')}
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
    shareItem,
    unshareItem
}) => {
    const isTask = 'taskNumber' in item;
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const { toast } = useToast();

    const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast({
            title: t('copied'),
            description: `${label} ${t('copiedToClipboard')}`,
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


    const priorityColor = item.priority <= 3
        ? 'from-emerald-400 to-green-500'
        : item.priority <= 6
            ? 'from-amber-400 to-orange-500'
            : 'from-rose-400 to-red-600';

    return (
        <Card
            onClick={() => onCardClick(item)}
            className={cn(
                "cursor-pointer transition-all hover:shadow-lg relative group overflow-hidden",
                isSelected
                    ? "ring-2 ring-primary shadow-md shadow-primary/20"
                    : "",
                item.isUrgent && !item.isDone && "urgent-pulse-glow",
                item.reminder && !item.isDone && new Date(item.reminder) < new Date() && "expired-pulse-glow",
                item.isDone && "opacity-60"
            )}
        >
            {/* Priority color bar on left */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-md bg-gradient-to-b", priorityColor)} />

            {isTask ? (
                <CardContent className="p-3 pl-5 flex items-start justify-between gap-4">
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
                                {/* Shared Indicator */}
                                {(item.sharedCount && item.sharedCount > 0) || (item as any)._isShared ? (
                                    <div className={cn(
                                        "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full shrink-0",
                                        (item as any)._isShared ? "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" : "text-primary bg-primary/10"
                                    )} title={(item as any)._isShared ? t('sharedWithMe') : t('sharedTimes', { count: item.sharedCount ?? 0 })}>
                                        <Users className="h-3 w-3" />
                                        {(item.sharedCount && item.sharedCount > 0) && !((item as any)._isShared) && <span>{item.sharedCount}</span>}
                                        {(item as any)._isShared && !(item as any)._seenAt && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                                        )}
                                    </div>
                                ) : null}
                                {item.isUrgent && !item.isDone && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                                <p
                                    className={cn("font-semibold break-words text-sm truncate hover:text-foreground cursor-copy transition-colors", item.isDone && "line-through text-muted-foreground")}
                                    onClick={(e) => handleCopy(e, item.name, t('itemName'))}
                                    title={t('clickToCopy')}
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
                        <ShareDialog item={item} onShare={shareItem} onUnshare={unshareItem} t={t} />
                        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0 pt-1">
                            <span>{format(item.createdAt, 'dd/MM/yyyy')}</span>
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
                <CardContent className="p-3 pl-5 flex items-start justify-between gap-4">
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
                                {/* Shared Indicator */}
                                {(item.sharedCount && item.sharedCount > 0) || (item as any)._isShared ? (
                                    <div className={cn(
                                        "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full shrink-0",
                                        (item as any)._isShared ? "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" : "text-primary bg-primary/10"
                                    )} title={(item as any)._isShared ? t('sharedWithMe') : t('sharedTimes', { count: item.sharedCount ?? 0 })}>
                                        <Users className="h-3 w-3" />
                                        {(item.sharedCount && item.sharedCount > 0) && !((item as any)._isShared) && <span>{item.sharedCount}</span>}
                                        {(item as any)._isShared && !(item as any)._seenAt && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                                        )}
                                    </div>
                                ) : null}
                                {item.isUrgent && !item.isDone && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                                <p
                                    className={cn("font-semibold break-words text-sm truncate hover:text-foreground cursor-copy transition-colors", item.isDone && "line-through text-muted-foreground")}
                                    onClick={(e) => handleCopy(e, item.name, t('itemName'))}
                                    title={t('clickToCopy')}
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
                        <ShareDialog item={item} onShare={shareItem} onUnshare={unshareItem} t={t} />
                        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0 pt-1">
                            <span>{format(item.createdAt, 'dd/MM/yyyy')}</span>
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
