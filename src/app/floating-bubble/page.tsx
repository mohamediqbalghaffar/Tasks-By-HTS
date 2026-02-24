'use client';

import * as React from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bell, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FloatingBubblePage() {
    const { t } = useLanguage();
    const { tasks, approvalLetters } = useTask();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const activeTasksCount = tasks.filter(t => !t.isDone).length;
    const activeLettersCount = approvalLetters.filter(l => !l.isDone).length;
    const totalNotifications = activeTasksCount + activeLettersCount;

    // This page is intended to be loaded in a small Electron/Capacitor overlay
    return (
        <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-transparent">
            <div className="relative group">
                {/* Notification Badge */}
                {totalNotifications > 0 && !isExpanded && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-50 border-2 border-white dark:border-black shadow-lg"
                    >
                        {totalNotifications}
                    </motion.div>
                )}

                {/* Main Bubble */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
                        "glass-card bg-primary/80 backdrop-blur-xl border-white/20 text-white",
                        isExpanded && "rounded-2xl w-48 h-auto p-4 flex-col gap-3"
                    )}
                >
                    {!isExpanded ? (
                        <Plus className="w-8 h-8" />
                    ) : (
                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">{t('HTS Tasks')}</span>
                                <Plus className="w-4 h-4 rotate-45 opacity-60" />
                            </div>

                            <div className="space-y-2">
                                <button className="flex items-center gap-3 w-full hover:bg-white/10 p-2 rounded-lg transition-colors text-left">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-medium leading-none mb-1">{t('tasksTab')}</p>
                                        <p className="text-[8px] opacity-60 truncate">{activeTasksCount} {t('active')}</p>
                                    </div>
                                </button>

                                <button className="flex items-center gap-3 w-full hover:bg-white/10 p-2 rounded-lg transition-colors text-left">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-medium leading-none mb-1">{t('lettersTab')}</p>
                                        <p className="text-[8px] opacity-60 truncate">{activeLettersCount} {t('active')}</p>
                                    </div>
                                </button>
                            </div>

                            <div className="pt-1 flex justify-center">
                                <Bell className={cn("w-4 h-4", totalNotifications > 0 ? "text-yellow-400 animate-bounce" : "opacity-30")} />
                            </div>
                        </div>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
