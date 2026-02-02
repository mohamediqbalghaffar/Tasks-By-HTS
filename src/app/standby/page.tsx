import * as React from 'react';
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTask, Task, ApprovalLetter } from '@/contexts/TaskContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Moon, Sun, ListChecks, Smartphone, Tablet } from 'lucide-react';
import LoadingAnimation from '@/components/ui/loading-animation';
import { cn } from '@/lib/utils';


const AnalogClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();

    return (
        <div className="standby-widget relative w-full max-w-[300px] md:max-w-none aspect-square flex items-center justify-center rounded-full p-4">
            <motion.svg
                className="absolute w-full h-full"
                viewBox="0 0 200 200"
            >
                {/* Static hour ticks */}
                {[...Array(12)].map((_, i) => (
                    <line
                        key={`hour-${i}`}
                        x1="100" y1="10" x2="100" y2="18"
                        stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5"
                        transform={`rotate(${i * 30}, 100, 100)`}
                    />
                ))}
                {/* Smaller minute ticks */}
                {[...Array(60)].map((_, i) => {
                    if (i % 5 === 0) return null; // Skip major hour ticks
                    return (
                        <line
                            key={`min-${i}`}
                            x1="100" y1="10" x2="100" y2="14"
                            stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"
                            transform={`rotate(${i * 6}, 100, 100)`}
                        />
                    );
                })}

                {/* Day/Night indicator */}
                <g transform={`rotate(${hours * 15 - 90}, 100, 100)`}>
                    {hours > 6 && hours < 18 ? (
                        <Sun size={12} color="white" x="18" y="94" />
                    ) : (
                        <Moon size={12} color="white" x="18" y="94" />
                    )}
                </g>
            </motion.svg>
            <div className="z-10 text-center text-white">
                <div
                    className="font-black text-7xl md:text-8xl leading-none tracking-tighter"
                    style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                >
                    <div className="h-20">{String(hours).padStart(2, '0')}</div>
                    <div className="h-20">{String(minutes).padStart(2, '0')}</div>
                </div>
            </div>
        </div>
    );
};


const PlaceholderWidget = ({ title, icon }: { title: string, icon: React.ReactNode }) => {
    return (
        <div className="standby-widget p-4 md:p-6 flex flex-col h-full w-full">
            <div className="flex items-center justify-between opacity-80 mb-2 md:mb-4">
                <h3 className="font-semibold text-white/90 text-sm md:text-base">{title}</h3>
                {icon}
            </div>
            <div className="flex-grow flex items-center justify-center">
                <p className="text-white/40 text-xs md:text-sm">Content for this widget</p>
            </div>
        </div>
    );
};


interface StandbyData {
    primary: Task | ApprovalLetter;
    nextThree: (Task | ApprovalLetter)[];
}

export default function StandbyPage() {
    const { t, getDateFnsLocale } = useLanguage();
    const { isLoading, tasks, approvalLetters, expiredTasksList, expiredApprovalLettersList } = useTask();
    const [standbyUncompleted, setStandbyUncompleted] = useState<StandbyData | null>(null);
    const [standbyExpired, setStandbyExpired] = useState<StandbyData | null>(null);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');


    const toggleOrientation = () => {
        const newOrientation = orientation === 'portrait' ? 'landscape' : 'portrait';

<<<<<<< HEAD
        // @ts-ignore - 'lock' is experimental and missing in some TS definitions
        if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock(newOrientation.includes('landscape') ? 'landscape-primary' : 'portrait-primary')
                .then(() => setOrientation(newOrientation))
                .catch((error: any) => console.error("Could not lock screen orientation:", error));
        } else if (screen.orientation) { // For browsers that don't support lock but have the property
=======
        // Safely check for lock() because TypeScript's DOM typings may not include it
        if (typeof (screen as any)?.orientation?.lock === 'function') {
            (screen as any).orientation.lock(newOrientation.includes('landscape') ? 'landscape-primary' : 'portrait-primary')
                .then(() => setOrientation(newOrientation))
                .catch((error: any) => console.error("Could not lock screen orientation:", error));
        } else if ((screen as any).orientation) { // For browsers that don't support lock but have the property
>>>>>>> 0a4993ab5100ac4261c740f1d916018d2e61ec48
            console.warn("Screen orientation lock is not supported on this browser.");
            setOrientation(newOrientation); // Optimistically set state
        }
    };


    useEffect(() => {
        if (!isLoading) {
            const allUncompleted = [...tasks.filter(t => !t.isDone), ...approvalLetters.filter(l => !l.isDone)]
                .sort((a, b) => (a.createdAt?.getTime() || new Date(a.startTime).getTime()) - (b.createdAt?.getTime() || new Date(b.startTime).getTime()));

            const allExpired = [...expiredTasksList, ...expiredApprovalLettersList]
                .sort((a, b) => (a.reminder?.getTime() || 0) - (b.reminder?.getTime() || 0));

            if (allUncompleted.length > 0) {
                setStandbyUncompleted({
                    primary: allUncompleted[0],
                    nextThree: allUncompleted.slice(1, 4),
                });
            } else {
                setStandbyUncompleted(null);
            }

            if (allExpired.length > 0) {
                setStandbyExpired({
                    primary: allExpired[0],
                    nextThree: allExpired.slice(1, 4),
                });
            } else {
                setStandbyExpired(null);
            }
        }
    }, [isLoading, tasks, approvalLetters, expiredTasksList, expiredApprovalLettersList]);

    if (isLoading) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-black overflow-hidden">
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleOrientation}
                    className="w-fit h-fit p-2 rounded-full text-white/50 hover:text-white bg-black/20 hover:bg-black/40 transition-colors"
                >
                    {orientation === 'portrait' ? <Smartphone className="h-6 w-6" /> : <Tablet className="h-6 w-6" />}
                    <span className="sr-only">Toggle Orientation</span>
                </Button>
                <Link href="/" passHref>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-fit h-fit p-2 rounded-full text-white/50 hover:text-white bg-black/20 hover:bg-black/40 transition-colors"
                    >
                        <X className="h-6 w-6" />
                        <span className="sr-only">{t('close')}</span>
                    </Button>
                </Link>
            </div>

            <div className="w-full max-w-6xl h-full flex flex-col md:grid md:grid-cols-3 md:grid-rows-2 gap-4">
                {/* Column 1: Clock */}
                <div className="md:col-span-1 md:row-span-2 flex items-center justify-center">
                    <AnalogClock />
                </div>

                {/* Column 2: Widgets */}
                <div className="md:col-span-1 md:row-span-2 flex flex-col gap-4 overflow-hidden">
                    {standbyUncompleted ? (
                        <div className="standby-widget p-4 md:p-6 flex flex-col h-full">
                            <div className="flex items-center justify-between opacity-80 mb-2 md:mb-4">
                                <h3 className="font-semibold text-white/90 text-sm md:text-base">{t('oldestUncompletedTask')}</h3>
                                <ListChecks size={20} />
                            </div>
                            <div className="flex-grow flex flex-col justify-center space-y-2 md:space-y-4">
                                <div className="p-3 md:p-4 rounded-lg bg-white/5">
                                    <h4 className="font-semibold text-white text-sm md:text-base">{standbyUncompleted.primary.name}</h4>
                                    <p className="text-white/60 mt-1 text-xs md:text-sm line-clamp-1">{standbyUncompleted.primary.detail}</p>
                                </div>
                                <div className="space-y-1 md:space-y-2">
                                    {standbyUncompleted.nextThree.map(item => (
                                        <div key={item.id} className="p-2 rounded-md bg-white/5 text-xs md:text-sm flex justify-between items-center">
                                            <span className="text-white/70 truncate pr-4">{item.name}</span>
                                            <span className="text-white/50 text-xs shrink-0">{format(item.startTime, 'P', { locale: getDateFnsLocale() })}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <PlaceholderWidget title={t('oldestUncompletedTask')} icon={<ListChecks size={20} />} />
                    )}

                    {standbyExpired ? (
                        <div className="standby-widget p-4 md:p-6 flex flex-col h-full">
                            <div className="flex items-center justify-between opacity-80 mb-2 md:mb-4">
                                <h3 className="font-semibold text-red-400/90 text-sm md:text-base">{t('oldestExpiredTask')}</h3>
                                <ListChecks size={20} className="text-red-400/90" />
                            </div>
                            <div className="flex-grow flex flex-col justify-center space-y-2 md:space-y-4">
                                <div className="p-3 md:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <h4 className="font-semibold text-white text-sm md:text-base">{standbyExpired.primary.name}</h4>
                                    <p className="text-red-300/80 mt-1 text-xs font-medium">
                                        {t('reminderLabel')} {standbyExpired.primary.reminder ? format(standbyExpired.primary.reminder, 'PPP', { locale: getDateFnsLocale() }) : 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1 md:space-y-2">
                                    {standbyExpired.nextThree.map(item => (
                                        <div key={item.id} className="p-2 rounded-md bg-red-500/10 text-xs md:text-sm flex justify-between items-center">
                                            <span className="text-white/70 truncate pr-4">{item.name}</span>
                                            {item.reminder && <span className="text-red-400/80 text-xs shrink-0">{format(item.reminder, 'P', { locale: getDateFnsLocale() })}</span>}  
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <PlaceholderWidget title={t('oldestExpiredTask')} icon={<ListChecks size={20} />} />
                    )}
                </div>

                {/* Column 3: Widgets (Hidden on mobile) */}
                <div className="hidden md:flex md:col-span-1 md:row-span-2 flex-col gap-4">
                    <PlaceholderWidget title="Music" icon={<ListChecks size={20} />} />
                    <div className="standby-widget p-6">
                        <h3 className="font-semibold text-white/90 opacity-80 mb-2">Date</h3>
                        <p className="text-4xl font-bold">{format(new Date(), 'dd')}</p>
                        <p className="text-lg text-white/60">{format(new Date(), 'eeee, MMMM')}</p>
                    </div>
                    <PlaceholderWidget title="Weather" icon={<Sun size={20} />} />
                </div>
            </div>
        </div>
    );
}