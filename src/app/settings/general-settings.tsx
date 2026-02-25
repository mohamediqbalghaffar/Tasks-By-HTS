'use client';

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUI } from '@/contexts/UIContext';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Languages, RotateCcw, Moon, Sun, Monitor, Smartphone, Palette, Database, Save, Upload, Trash2, Info, Download } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Locale } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { toast } from "@/hooks/use-toast";

export function GeneralSettings() {
    const { language, setLanguage, t } = useLanguage();
    const { uiFont, setUiFont, theme, setTheme, viewMode, setViewMode } = useUI();
    const {
        handleSaveData,
        handleLoadData,
        handleClearAllData,
        isLocalStorageAllowed,
        handlePermissionResponse,
        isAutoBackupEnabled,
        toggleAutoBackup
    } = useTask();
    const { currentUser } = useAuth();

    const loadFileInputRef = React.useRef<HTMLInputElement>(null);

    // Simplified Font Options
    const uiFontOptions = [
        { name: 'Speda (Default)', value: 'Speda, sans-serif' },
        { name: 'Noto Sans Arabic', value: '"Noto Sans Arabic", sans-serif' },
        { name: 'Rabar', value: 'Rabar_021, sans-serif' },
        { name: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    ];

    const isRtl = language === 'ku';

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Appearance Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <Palette className="h-5 w-5" />
                    {t('appearance')}
                </h2>
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardContent className="space-y-6 pt-6">
                        {/* Theme Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">{t('theme')}</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all hover:bg-accent/10",
                                        theme === 'light' ? "border-primary bg-primary/5" : "border-border bg-card"
                                    )}
                                >
                                    <Sun className="h-6 w-6" />
                                    <span className="text-sm">{t('themeLight')}</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all hover:bg-accent/10",
                                        theme === 'dark' ? "border-primary bg-primary/5" : "border-border bg-card"
                                    )}
                                >
                                    <Moon className="h-6 w-6" />
                                    <span className="text-sm">{t('themeDark')}</span>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all hover:bg-accent/10",
                                        theme === 'system' ? "border-primary bg-primary/5" : "border-border bg-card"
                                    )}
                                >
                                    <Monitor className="h-6 w-6" />
                                    <span className="text-sm">{t('themeSystem')}</span>
                                </button>
                            </div>
                        </div>

                        <Separator />

                        {/* View Mode Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">{t('viewMode')}</Label>
                            <p className="text-sm text-muted-foreground">{t('viewModeDesc')}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setViewMode('desktop')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all hover:bg-accent/10",
                                        viewMode === 'desktop' ? "border-primary bg-primary/5" : "border-border bg-card"
                                    )}
                                >
                                    <Monitor className="h-6 w-6" />
                                    <span className="text-sm">{t('viewModeDesktop')}</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('mobile')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all hover:bg-accent/10",
                                        viewMode === 'mobile' ? "border-primary bg-primary/5" : "border-border bg-card"
                                    )}
                                >
                                    <Smartphone className="h-6 w-6" />
                                    <span className="text-sm">{t('viewModeMobile')}</span>
                                </button>
                            </div>
                        </div>

                        <Separator />

                        {/* Language */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium">{t('languageSettings')}</Label>
                                <p className="text-sm text-muted-foreground">{t('languageSettingsDescription')}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-[180px] justify-between">
                                        {t('kurdish')}
                                        <Languages className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[180px]" align={isRtl ? "start" : "end"}>
                                    <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as Locale)}>
                                        <DropdownMenuRadioItem value="ku" className="justify-between">
                                            {t('kurdish')}
                                            {language === 'ku' && <span className="text-primary">✓</span>}
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Separator />

                        {/* Font */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">{t('uiFont')}</Label>
                            <Select value={uiFont} onValueChange={setUiFont} dir={isRtl ? "rtl" : "ltr"}>
                                <SelectTrigger className={`h-12 w-full bg-card/50 ${isRtl ? 'text-right' : 'text-left'}`}>
                                    <SelectValue placeholder={t('fontSelect')} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]" align={isRtl ? "end" : "start"}>
                                    {uiFontOptions.map(font => (
                                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }} className={`cursor-pointer ${isRtl ? 'justify-end text-right' : ''}`}>
                                            {font.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Management Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <Database className="h-5 w-5" />
                    {t('dataManagement')}
                </h2>
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
                            <div className="space-y-0.5">
                                <Label htmlFor="local-storage-switch" className="text-base">{t('autoSaveToLocal')}</Label>
                                <p className="text-sm text-muted-foreground">{t('autoSaveToLocalDesc')}</p>
                            </div>
                            <Switch id="local-storage-switch" checked={isLocalStorageAllowed === true} onCheckedChange={handlePermissionResponse} dir='ltr' />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
                            <div className="space-y-0.5">
                                <Label htmlFor="auto-backup-switch" className="text-base">{t('autoBackup')}</Label>
                                <p className="text-sm text-muted-foreground">{t('autoBackupDesc')}</p>
                            </div>
                            <Switch id="auto-backup-switch" checked={isAutoBackupEnabled} onCheckedChange={toggleAutoBackup} dir='ltr' />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={handleSaveData} className="h-20 flex flex-col gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5">
                                <Save className="h-6 w-6 text-primary" />
                                {t('saveData')}
                            </Button>
                            <Button variant="outline" onClick={() => loadFileInputRef.current?.click()} className="h-20 flex flex-col gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5">
                                <Upload className="h-6 w-6 text-primary" />
                                {t('loadData')}
                            </Button>
                        </div>
                        <input type="file" ref={loadFileInputRef} onChange={handleLoadData} accept=".json" className="hidden" />

                        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                            <h3 className="text-destructive font-medium mb-2 flex items-center gap-2"><Trash2 className="h-4 w-4" /> {t('dangerZone')}</h3>
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" className="w-full">{t('clearAllData')}</Button></AlertDialogTrigger>
                                <AlertDialogContent dir={isRtl ? 'rtl' : 'ltr'}>
                                    <AlertDialogHeader><AlertDialogTitle>{t('confirmClearAllDataTitle')}</AlertDialogTitle><AlertDialogDescription>{currentUser ? t('confirmClearAllDataDescriptionFirestore') : t('confirmClearAllDataDescription')}</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2"><AlertDialogCancel>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={handleClearAllData} className="bg-destructive hover:bg-destructive/90">{t('confirmDelete')}</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* App Downloads Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <Download className="h-5 w-5" />
                    {t('downloadApp')}
                </h2>
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardContent className="space-y-6 pt-6">
                        <p className="text-sm text-muted-foreground">
                            {t('downloadAppDescription')}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Windows Download */}
                            <div className="space-y-3 p-4 rounded-xl border border-primary/10 bg-primary/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Monitor className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold">{t('downloadWindowsExe')}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('downloadExeInfoDesc')}
                                </p>
                                <Button
                                    className="w-full gap-2"
                                    variant="outline"
                                    onClick={() => window.open('https://github.com/mohamediqbalghaffar/Tasks-By-HTS/releases/latest/download/Tasks-by-HTS-Windows.zip', '_blank')}
                                >
                                    <Download className="h-4 w-4" />
                                    {t('download')}
                                </Button>
                            </div>

                            {/* Android Download */}
                            <div className="space-y-3 p-4 rounded-xl border border-primary/10 bg-primary/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold">{t('downloadAndroidApk')}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t('downloadApkInfoDesc')}
                                </p>
                                <Button
                                    className="w-full gap-2"
                                    variant="outline"
                                    onClick={() => window.open('https://github.com/mohamediqbalghaffar/Tasks-By-HTS/releases/latest/download/Tasks-by-HTS-Android.apk', '_blank')}
                                >
                                    <Download className="h-4 w-4" />
                                    {t('download')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* About Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <Info className="h-5 w-5" />
                    {t('about')}
                </h2>
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6 space-y-6">
                        <div className="text-center space-y-4">
                            <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                <span className="text-3xl font-bold text-primary">HTS</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Tasks (by HTS)</h3>
                                <p className="text-muted-foreground mt-1">Version 1.0.0</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4 text-right">
                            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                <h4 className="font-semibold text-lg text-primary">دروستکراوە لەلایەن:</h4>
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium text-base">محمد اقبال غفار</p>
                                    <p className="text-muted-foreground">جێگری بەڕێوەبەری کارگێڕی</p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        ئۆفیسی سەرەکیی کۆمپانیای هەڵەبجە بۆ خزمەتگوزاری تیلیکۆم و وزەی نوێبووەوە HTS (سنووردار)
                                    </p>
                                </div>
                            </div>

                            <div className="bg-primary/5 rounded-lg p-4 space-y-2 text-sm">
                                <p className="font-medium">کۆمپانیای هەڵەبجە بۆ خزمەتگوزاری تیلیکۆم</p>
                                <p className="text-muted-foreground">Halabja Telecom Services (HTS)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />
            <Button variant="ghost" onClick={() => window.location.reload()} className="w-full text-muted-foreground">
                <RotateCcw className="mr-2 h-4 w-4" />
                {t('refresh')}
            </Button>
        </div>
    );
}
