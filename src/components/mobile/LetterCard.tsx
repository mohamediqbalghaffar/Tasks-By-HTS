'use client';

import * as React from 'react';
import { MoreVertical, CheckCircle2, Circle, FileText, AlertTriangle, Copy } from 'lucide-react';
import { ApprovalLetter } from '@/contexts/LanguageContext';
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompletionDialog } from '@/components/ui/completion-dialog';

interface LetterCardProps {
    letter: ApprovalLetter;
    onComplete: (letter: ApprovalLetter, date?: Date) => void;
    onDelete: (letter: ApprovalLetter) => void;
    onEdit: (letter: ApprovalLetter) => void;
    t: (key: string) => string;
    getDateFnsLocale: () => any;
    cardNumber?: number;
}

export function LetterCard({ letter, onComplete, onDelete, onEdit, t, getDateFnsLocale, cardNumber }: LetterCardProps) {
    const isExpired = letter.reminder && new Date(letter.reminder) < new Date() && !letter.isDone;
    const [showCompletionDialog, setShowCompletionDialog] = React.useState(false);

    const getPriorityColor = (priority: number) => {
        if (priority >= 8) return 'bg-red-500/10 text-red-600 border-red-200';
        if (priority >= 5) return 'bg-orange-500/10 text-orange-600 border-orange-200';
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            description: `${label} ${t('copied')}`,
            duration: 2000,
        });
    };

    return (
        <div className={cn(
            "bg-card rounded-xl p-4 mb-3 border shadow-sm active:shadow-md transition-all",
            letter.isDone && "opacity-60 bg-muted/50",
            isExpired && "border-l-4 border-l-destructive border-y border-r"
        )}>
            <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (letter.isDone) {
                                onComplete(letter);
                            } else {
                                setShowCompletionDialog(true);
                            }
                        }}
                        className="mt-0.5 shrink-0 h-11 w-11 -ml-2 -mt-2 flex items-center justify-center rounded-full active:bg-muted/50 transition-colors"
                        aria-label={letter.isDone ? t('markAsActive') : t('markAsDone')}
                    >
                        {letter.isDone ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        )}
                    </button>
                    <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className="flex items-center gap-1 min-w-0">
                                <h3 className={cn(
                                    "font-semibold text-base leading-snug break-words text-foreground",
                                    letter.isDone && "line-through text-muted-foreground"
                                )}>
                                    {letter.name}
                                </h3>
                                <button
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(letter.name, t('letterNameValueLabel')); }}
                                    className="opacity-50 hover:opacity-100 p-1"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                            </div>

                            {letter.letterCode && (
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground whitespace-nowrap">
                                        {letter.letterCode}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(letter.letterCode || '', t('letterCode')); }}
                                        className="opacity-50 hover:opacity-100 p-1"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {letter.sentTo && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="opacity-70">{t('sentTo')}:</span>
                                <span className="font-medium">{t(letter.sentTo)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="h-11 w-11 -mr-2 -mt-2 flex items-center justify-center text-muted-foreground rounded-full active:bg-muted transition-colors"
                            aria-label={t('actions')}
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onEdit(letter)} className="h-11">
                            {t('open')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            if (letter.isDone) {
                                onComplete(letter);
                            } else {
                                setShowCompletionDialog(true);
                            }
                        }} className="h-11">
                            {letter.isDone ? t('markAsActive') : t('markAsDone')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(letter)}
                            className="text-destructive h-11"
                        >
                            {t('delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {letter.detail && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3 break-words">
                    {letter.detail}
                </p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-foreground font-medium">
                    #{letter.letterNumber}
                </span>
                {cardNumber !== undefined && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/80 text-muted-foreground font-mono font-medium">
                        {cardNumber}
                    </span>
                )}
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/50 text-muted-foreground border-transparent">
                    {formatDistanceToNowStrict(new Date(letter.createdAt), {
                        addSuffix: true,
                        locale: getDateFnsLocale()
                    })}
                </span>
                <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md border", getPriorityColor(letter.priority))}>
                    {t('priority')} {letter.priority}
                </span>
            </div>
            <CompletionDialog
                isOpen={showCompletionDialog}
                onOpenChange={setShowCompletionDialog}
                onConfirm={(date) => onComplete(letter, date)}
                t={t}
            />
        </div>
    );
}
