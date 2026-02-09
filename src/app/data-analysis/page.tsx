'use client';

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTask, Task, ApprovalLetter } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import LoadingAnimation from '@/components/ui/loading-animation';
import { useRouter } from 'next/navigation';
import { ListChecks, CheckCircle, AlertTriangle, BarChartHorizontal } from 'lucide-react';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { subDays, subMonths, isWithinInterval, format } from 'date-fns';

const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
        <circle
            cx={cx}
            cy={cy}
            r={payload.urgency > 5 ? 8 : 6}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth={1.5}
            style={{ filter: `drop-shadow(0 2px 4px hsl(var(--primary) / 0.5))` }}
        />
    );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent * 100 < 5) return null;

    return (
        <text
            x={x}
            y={y}
            fill="hsl(var(--card-foreground))"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-xs font-bold"
            style={{ pointerEvents: 'none' }}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

interface KPIDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    value: number | string;
    items?: (Task | ApprovalLetter)[];
    t: (key: string) => string;
}

const KPIDetailModal: React.FC<KPIDetailModalProps> = ({ isOpen, onClose, title, description, value, items, t }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="text-4xl font-bold text-primary">{value}</div>
                    {items && items.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">{t('items')}:</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {items.map((item, index) => (
                                    <Card key={item.id} className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.detail}</p>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.createdAt && format(new Date(item.createdAt), 'dd/MM/yyyy')}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function DataAnalysisPage() {
    const { t, getDateFnsLocale } = useLanguage();
    const router = useRouter();

    const { currentUser } = useAuth(); // Needed for deduplication
    const {
        isMounted,
        isInitialDataLoading,
        tasks,
        approvalLetters,
        expiredTasksList,
        expiredApprovalLettersList,
        receivedItems, // Get received items
    } = useTask();

    const {
        showTasks,
        setShowTasks,
    } = useUI();

    // Date range filter state
    const [fromDate, setFromDate] = React.useState<Date | null>(null);
    const [toDate, setToDate] = React.useState<Date | null>(null);

    // KPI Modal state
    const [kpiModal, setKpiModal] = React.useState<{
        isOpen: boolean;
        title: string;
        description: string;
        value: number | string;
        items?: (Task | ApprovalLetter)[];
    }>({
        isOpen: false,
        title: '',
        description: '',
        value: 0,
        items: []
    });

    const handlePresetSelect = React.useCallback((preset: 'last7Days' | 'last30Days' | 'last3Months' | 'allTime') => {
        const now = new Date();
        switch (preset) {
            case 'last7Days':
                setFromDate(subDays(now, 7));
                setToDate(now);
                break;
            case 'last30Days':
                setFromDate(subDays(now, 30));
                setToDate(now);
                break;
            case 'last3Months':
                setFromDate(subMonths(now, 3));
                setToDate(now);
                break;
            case 'allTime':
                setFromDate(null);
                setToDate(null);
                break;
        }
    }, []);

    const handleClearFilter = React.useCallback(() => {
        setFromDate(null);
        setToDate(null);
    }, []);

    const openKPIModal = React.useCallback((title: string, description: string, value: number | string, items?: (Task | ApprovalLetter)[]) => {
        setKpiModal({ isOpen: true, title, description, value, items });
    }, []);

    const closeKPIModal = React.useCallback(() => {
        setKpiModal(prev => ({ ...prev, isOpen: false }));
    }, []);

    const { kpiData, matrixData, statusData, priorityData, filteredItems } = React.useMemo(() => {
        const relevantItems = showTasks ? tasks : approvalLetters;
        const relevantExpired = showTasks ? expiredTasksList : expiredApprovalLettersList;

        // Process received items (Shared with me)
        // 1. Filter by type (task/letter) based on showTasks
        // 2. Deduplicate: exclude items where I am the original owner (already in relevantItems)
        // 3. Deduplicate: if multiple shares of same item exist, take only one
        const relevantReceivedItems = receivedItems
            .filter(item => {
                const typeMatch = showTasks ? item.originalItemType === 'task' : item.originalItemType === 'letter';
                const notMyOwn = item.originalOwnerUid !== currentUser?.uid;
                return typeMatch && notMyOwn;
            })
            .filter((item, index, self) =>
                index === self.findIndex((t) => t.originalItemId === item.originalItemId)
            )
            // Map to Task | ApprovalLetter compatible object
            .map(item => {
                // Cast to any to access properties that might be omitted in the strict type definition but exist at runtime
                const data = { ...(item.data as any) };

                // Ensure dates are Date objects
                if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate();
                else if (typeof data.createdAt === 'string') data.createdAt = new Date(data.createdAt);

                if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate();
                else if (typeof data.updatedAt === 'string') data.updatedAt = new Date(data.updatedAt);

                if (data.reminder?.toDate) data.reminder = data.reminder.toDate();
                else if (typeof data.reminder === 'string') data.reminder = new Date(data.reminder);

                // Add received item ID as the ID for this analysis item
                return {
                    ...data,
                    id: item.id,
                } as Task | ApprovalLetter;
            });

        // ALL items including expired, deleted, AND shared
        const allItems = [...relevantItems, ...relevantExpired, ...relevantReceivedItems];

        // Apply date filter
        let filtered = allItems;
        if (fromDate && toDate) {
            filtered = allItems.filter(item => {
                const itemDate = (item.createdAt as any)?.toDate ? (item.createdAt as any).toDate() : new Date(item.createdAt);
                return isWithinInterval(itemDate, { start: fromDate, end: toDate });
            });
        }

        const activeItems = filtered.filter(item => !item.isDone && item.status !== 'expired');
        const completedItems = filtered.filter(item => item.isDone);
        const urgentItems = activeItems.filter(item => item.isUrgent);

        // --- KPI DATA ---
        const totalActive = activeItems.length;
        const totalCompleted = completedItems.length;
        const totalItems = filtered.length; // ALL items (active + completed + expired)
        const urgentCount = urgentItems.length;

        // Median Time Calculation
        let medianTime = 0;
        let medianTimeLabel = t('noDataToDownload');

        if (completedItems.length > 0) {
            const durations = completedItems.map(item => {
                const created = (item.createdAt as any)?.toDate ? (item.createdAt as any).toDate() : new Date(item.createdAt);
                const completed = item.completedAt
                    ? ((item.completedAt as any)?.toDate ? (item.completedAt as any).toDate() : new Date(item.completedAt))
                    : ((item.updatedAt as any)?.toDate ? (item.updatedAt as any).toDate() : new Date(item.updatedAt));
                return completed.getTime() - created.getTime();
            }).sort((a, b) => a - b);

            const mid = Math.floor(durations.length / 2);
            medianTime = durations.length % 2 !== 0 ? durations[mid] : (durations[mid - 1] + durations[mid]) / 2;

            // Format duration
            const days = Math.floor(medianTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((medianTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (days > 0) {
                medianTimeLabel = `${days} ${t('countdownDays')} ${hours} ${t('countdownHours')}`;
            } else {
                medianTimeLabel = `${hours} ${t('countdownHours')}`;
            }
        } else {
            medianTimeLabel = "0";
        }

        const kpi = {
            totalActive,
            totalCompleted,
            totalItems,
            urgentCount,
            avgPriority: medianTimeLabel,
            activeItems,
            completedItems,
            urgentItems,
            allItems: filtered
        };

        // --- EISENHOWER MATRIX DATA ---
        const matrix = activeItems.map(item => ({
            id: item.id,
            name: item.name,
            importance: 11 - item.priority,
            urgency: item.isUrgent ? 8 : 3,
        }));

        // --- STATUS OVERVIEW DATA ---
        const status = [
            { name: t('activeCount'), value: totalActive },
            { name: t('completedCount'), value: totalCompleted },
        ];

        // --- TIME DISTRIBUTION DATA ---
        const timeBuckets = {
            lessThanOneDay: 0,
            oneToThreeDays: 0,
            threeToSevenDays: 0,
            moreThanOneWeek: 0
        };

        completedItems.forEach(item => {
            const created = (item.createdAt as any)?.toDate ? (item.createdAt as any).toDate() : new Date(item.createdAt);
            const completed = item.completedAt
                ? ((item.completedAt as any)?.toDate ? (item.completedAt as any).toDate() : new Date(item.completedAt))
                : ((item.updatedAt as any)?.toDate ? (item.updatedAt as any).toDate() : new Date(item.updatedAt));
            const durationMs = completed.getTime() - created.getTime();
            const durationDays = durationMs / (1000 * 60 * 60 * 24);

            if (durationDays < 1) timeBuckets.lessThanOneDay++;
            else if (durationDays <= 3) timeBuckets.oneToThreeDays++;
            else if (durationDays <= 7) timeBuckets.threeToSevenDays++;
            else timeBuckets.moreThanOneWeek++;
        });

        const priority = [
            { name: t('lessThanOneDay'), value: timeBuckets.lessThanOneDay },
            { name: t('oneToThreeDays'), value: timeBuckets.oneToThreeDays },
            { name: t('threeToSevenDays'), value: timeBuckets.threeToSevenDays },
            { name: t('moreThanOneWeek'), value: timeBuckets.moreThanOneWeek },
        ].filter(item => item.value > 0);

        return { kpiData: kpi, matrixData: matrix, statusData: status, priorityData: priority, filteredItems: filtered };
    }, [tasks, approvalLetters, expiredTasksList, expiredApprovalLettersList, receivedItems, currentUser, showTasks, t, fromDate, toDate]);

    const handleScatterClick = React.useCallback((props: any) => {
        if (props && props.id) {
            router.push(`/item/${props.id}`);
        }
    }, [router]);

    const CustomTooltip = React.useCallback(({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-2 text-sm rounded-md glass-card">
                    <p className="font-bold text-primary">{`${data.name}`}</p>
                </div>
            );
        }
        return null;
    }, []);

    const DataChartTooltip = React.useCallback(({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const name = data.name || label;
            return (
                <div className="p-2 text-sm rounded-md glass-card">
                    <p className="font-bold text-primary">{name}</p>
                    <p className="text-foreground">{`${t('countLabel', { count: data.value })}`}</p>
                </div>
            );
        }
        return null;
    }, [t]);

    const COLORS = React.useMemo(() => [
        "hsl(var(--primary))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-1))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
        "hsl(var(--accent))",
        "hsl(var(--secondary))",
    ], []);

    if (!isMounted || isInitialDataLoading) {
        return <LoadingAnimation text={t('loadingData')} />;
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut",
            },
        }),
    };

    return (
        <div className="p-4 md:p-8 space-y-8" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{t('analysisPageTitle')}</h1>
                    <p className="text-muted-foreground">{t('analysisPageDescription')}</p>
                </div>
                <div className="flex items-center bg-muted p-1 rounded-lg self-start md:self-center">
                    <Button variant={showTasks ? "default" : "ghost"} onClick={() => setShowTasks(true)} className="px-3 py-1 h-8 text-sm">{t('tasksTab')}</Button>
                    <Button variant={!showTasks ? "default" : "ghost"} onClick={() => setShowTasks(false)} className="px-3 py-1 h-8 text-sm">{t('lettersTab')}</Button>
                </div>
            </div>

            {/* Date Range Filter */}
            <DateRangeFilter
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
                onPresetSelect={handlePresetSelect}
                onClear={handleClearFilter}
                t={t}
                getDateFnsLocale={getDateFnsLocale}
            />

            <motion.div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
                {/* Total Items KPI - Clickable */}
                <motion.div variants={cardVariants}>
                    <Card
                        className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                        onClick={() => openKPIModal(t('totalItems'), t('totalItemsDesc'), kpiData.totalItems, kpiData.allItems)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('totalItems')}</CardTitle>
                            <BarChartHorizontal className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.totalItems}</div>
                            <p className="text-xs text-muted-foreground">{t('totalItemsDesc')}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Active Items KPI - Clickable */}
                <motion.div variants={cardVariants}>
                    <Card
                        className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                        onClick={() => openKPIModal(t('totalActiveItems'), t('currentlyActive', { type: showTasks ? t('tasksTab') : t('lettersTab') }), kpiData.totalActive, kpiData.activeItems)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('totalActiveItems')}</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.totalActive}</div>
                            <p className="text-xs text-muted-foreground">{t('currentlyActive', { type: showTasks ? t('tasksTab') : t('lettersTab') })}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Completed Items KPI - Clickable */}
                <motion.div variants={cardVariants}>
                    <Card
                        className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                        onClick={() => openKPIModal(t('totalCompletedItems'), t('itemsCompleted'), kpiData.totalCompleted, kpiData.completedItems)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('totalCompletedItems')}</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.totalCompleted}</div>
                            <p className="text-xs text-muted-foreground">{t('itemsCompleted')}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Urgent Items KPI - Clickable */}
                <motion.div variants={cardVariants}>
                    <Card
                        className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                        onClick={() => openKPIModal(t('urgentItems'), t('requireImmediateAttention'), kpiData.urgentCount, kpiData.urgentItems)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('urgentItems')}</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{kpiData.urgentCount}</div>
                            <p className="text-xs text-muted-foreground">{t('requireImmediateAttention')}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Median Time KPI - Clickable */}
                <motion.div variants={cardVariants}>
                    <Card
                        className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                        onClick={() => openKPIModal(t('medianTimeToComplete'), t('medianCompletionTime'), kpiData.avgPriority, kpiData.completedItems)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('medianTimeToComplete')}</CardTitle>
                            <BarChartHorizontal className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.avgPriority}</div>
                            <p className="text-xs text-muted-foreground">{t('medianCompletionTime')}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Eisenhower Matrix - Fixed Size */}
                <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="lg:col-span-2">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{t('eisenhowerMatrix')}</CardTitle>
                            <CardDescription>{t('matrixScheduleTitle')} vs. {t('matrixDelegateTitle')}</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[500px] relative">
                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 -z-10">
                                <div className="quadrant-schedule flex items-start justify-start p-4 rounded-tl-lg"><span className="quadrant-label">{t('matrixScheduleTitle')}</span></div>
                                <div className="quadrant-do flex items-start justify-end p-4 rounded-tr-lg text-right"><span className="quadrant-label">{t('matrixDoTitle')}</span></div>
                                <div className="quadrant-eliminate flex items-end justify-start p-4 rounded-bl-lg"><span className="quadrant-label">{t('matrixEliminateTitle')}</span></div>
                                <div className="quadrant-delegate flex items-end justify-end p-4 rounded-br-lg text-right"><span className="quadrant-label">{t('matrixDelegateTitle')}</span></div>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                                    <XAxis type="number" dataKey="urgency" name={t('matrixDelegateTitle')} domain={[0, 10]} tickCount={6} stroke="hsl(var(--foreground) / 0.5)" tick={{ fontSize: 12 }} />
                                    <YAxis type="number" dataKey="importance" name={t('matrixScheduleTitle')} domain={[0, 10]} tickCount={6} stroke="hsl(var(--foreground) / 0.5)" tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                                    <Scatter data={matrixData} shape={<CustomDot />} onClick={handleScatterClick} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Status Overview - Fixed Size */}
                <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{t('itemStatusOverview')}</CardTitle>
                            <CardDescription>{showTasks ? t('tasksTab') : t('lettersTab')}</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis dataKey="name" type="category" width={60} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip content={<DataChartTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }} />
                                    <Bar dataKey="value" name={showTasks ? t('tasksTab') : t('lettersTab')} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={35} isAnimationActive={true} animationDuration={800} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Time Distribution - Fixed Size */}
                <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{t('timeToCompleteDistribution')}</CardTitle>
                            <CardDescription>{t('activeCount')} - {showTasks ? t('tasksTab') : t('lettersTab')}</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={120}
                                        innerRadius={70}
                                        paddingAngle={5}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        isAnimationActive={true}
                                        animationDuration={800}
                                    >
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<DataChartTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* KPI Detail Modal */}
            <KPIDetailModal
                isOpen={kpiModal.isOpen}
                onClose={closeKPIModal}
                title={kpiModal.title}
                description={kpiModal.description}
                value={kpiModal.value}
                items={kpiModal.items}
                t={t}
            />
        </div>
    );
}
