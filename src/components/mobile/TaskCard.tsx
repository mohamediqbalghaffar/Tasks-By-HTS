'use client';

import * as React from 'react';
import { MoreVertical, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { Task } from '@/contexts/LanguageContext';
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompletionDialog } from '@/components/ui/completion-dialog';

interface TaskCardProps {
    task: Task;
    onComplete: (task: Task, date?: Date) => void;
    onDelete: (task: Task) => void;
    onEdit: (task: Task) => void;
    t: (key: string) => string;
    getDateFnsLocale: () => any;
    cardNumber?: number;
}

export function TaskCard({ task, onComplete, onDelete, onEdit, t, getDateFnsLocale, cardNumber }: TaskCardProps) {
    const isExpired = task.reminder && new Date(task.reminder) < new Date() && !task.isDone;
    const [showCompletionDialog, setShowCompletionDialog] = React.useState(false);

    const getPriorityColor = (priority: number) => {
        if (priority >= 8) return 'bg-red-500/10 text-red-600 border-red-200';
        if (priority >= 5) return 'bg-orange-500/10 text-orange-600 border-orange-200';
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
    };

    return (
        <div className={cn(
            "bg-card rounded-xl p-4 mb-3 border shadow-sm active:shadow-md transition-all",
            task.isDone && "opacity-60 bg-muted/50",
            isExpired && "border-r-4 border-r-destructive border-y border-l"
        )} dir="rtl">
            <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (task.isDone) {
                                onComplete(task);
                            } else {
                                setShowCompletionDialog(true);
                            }
                        }}
                        className="mt-0.5 shrink-0 h-11 w-11 -mr-2 -mt-2 flex items-center justify-center rounded-full active:bg-muted/50 transition-colors"
                        aria-label={task.isDone ? t('markAsActive') : t('markAsDone')}
                    >
                        {task.isDone ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                    </button>
                    <div className="flex-1 min-w-0 py-0.5">
                        <h3 className={cn(
                            "font-semibold text-base leading-snug break-words text-foreground",
                            task.isDone && "line-through text-muted-foreground"
                        )}>
                            {task.name}
                        </h3>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="h-11 w-11 -ml-2 -mt-2 flex items-center justify-center text-muted-foreground rounded-full active:bg-muted transition-colors"
                            aria-label={t('actions')}
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onEdit(task)} className="h-11">
                            {t('open')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            if (task.isDone) {
                                onComplete(task);
                            } else {
                                setShowCompletionDialog(true);
                            }
                        }} className="h-11">
                            {task.isDone ? t('markAsActive') : t('markAsDone')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(task)}
                            className="text-destructive h-11"
                        >
                            {t('delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {task.detail && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3 break-words">
                    {task.detail}
                </p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-foreground font-medium">
                    #{task.taskNumber}
                </span>
                {cardNumber !== undefined && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/80 text-muted-foreground font-mono font-medium">
                        {cardNumber}
                    </span>
                )}
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/50 text-muted-foreground border-transparent">
                    {formatDistanceToNowStrict(new Date(task.createdAt), {
                        addSuffix: true,
                        locale: getDateFnsLocale()
                    })}
                </span>
                <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md border", getPriorityColor(task.priority))}>
                    {t('priority')} {task.priority}
                </span>
            </div>
            <CompletionDialog
                isOpen={showCompletionDialog}
                onOpenChange={setShowCompletionDialog}
                onConfirm={(date) => onComplete(task, date)}
                t={t}
            />
        </div>
    );
}
