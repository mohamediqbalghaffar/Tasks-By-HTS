'use client';

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_COMPANIES, DEFAULT_POSITIONS, type SelectOption } from '@/lib/constants';

export function AdminSettings() {
    const { t, language } = useLanguage();
    const { userProfile } = useAuth();
    const [companyOptions, setCompanyOptions] = React.useState<SelectOption[]>(DEFAULT_COMPANIES);
    const [positionOptions, setPositionOptions] = React.useState<SelectOption[]>(DEFAULT_POSITIONS);
    const [editingCompany, setEditingCompany] = React.useState<string | null>(null);
    const [editingPosition, setEditingPosition] = React.useState<string | null>(null);
    const [newCompanyLabel, setNewCompanyLabel] = React.useState('');
    const [newPositionLabel, setNewPositionLabel] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const isRtl = language === 'ku';

    // Check if user is admin
    if (!userProfile || userProfile.role !== 'admin') {
        return (
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">{t('adminOnly')}</h3>
                        <p className="text-muted-foreground">{t('notAuthorized')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Load options from Firestore
    React.useEffect(() => {
        const loadOptions = async () => {
            if (!db) return;

            try {
                const companyDoc = await getDoc(doc(db, 'systemSettings', 'companyOptions'));
                if (companyDoc.exists()) {
                    setCompanyOptions(companyDoc.data().options || DEFAULT_COMPANIES);
                }

                const positionDoc = await getDoc(doc(db, 'systemSettings', 'positionOptions'));
                if (positionDoc.exists()) {
                    setPositionOptions(positionDoc.data().options || DEFAULT_POSITIONS);
                }
            } catch (error) {
                console.error('Error loading options:', error);
            }
        };

        loadOptions();
    }, []);

    const saveCompanyOptions = async () => {
        if (!db) return;

        setIsLoading(true);
        try {
            await setDoc(doc(db, 'systemSettings', 'companyOptions'), {
                options: companyOptions
            });
            toast({
                title: t('saveOption'),
                description: t('changesSavedSuccess')
            });
        } catch (error) {
            console.error('Error saving company options:', error);
            toast({
                title: t('error'),
                description: t('errorSavingChanges'),
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const savePositionOptions = async () => {
        if (!db) return;

        setIsLoading(true);
        try {
            await setDoc(doc(db, 'systemSettings', 'positionOptions'), {
                options: positionOptions
            });
            toast({
                title: t('saveOption'),
                description: t('changesSavedSuccess')
            });
        } catch (error) {
            console.error('Error saving position options:', error);
            toast({
                title: t('error'),
                description: t('errorSavingChanges'),
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addCompanyOption = () => {
        if (!newCompanyLabel.trim()) return;

        const newId = `company_${Date.now()}`;
        const newOption: SelectOption = {
            id: newId,
            label: newCompanyLabel.trim()
        };

        setCompanyOptions([...companyOptions, newOption]);
        setNewCompanyLabel('');
    };

    const addPositionOption = () => {
        if (!newPositionLabel.trim()) return;

        const newId = `position_${Date.now()}`;
        const newOption: SelectOption = {
            id: newId,
            label: newPositionLabel.trim()
        };

        setPositionOptions([...positionOptions, newOption]);
        setNewPositionLabel('');
    };

    const deleteCompanyOption = (id: string) => {
        setCompanyOptions(companyOptions.filter(opt => opt.id !== id));
    };

    const deletePositionOption = (id: string) => {
        setPositionOptions(positionOptions.filter(opt => opt.id !== id));
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <Shield className="h-5 w-5" />
                    {t('adminSettings')}
                </h2>
                <p className="text-sm text-muted-foreground">{t('adminSettingsDescription')}</p>

                {/* Company Options */}
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base">{t('companyOptions')}</CardTitle>
                        <CardDescription>{t('companyOptions')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {companyOptions.map((option) => (
                                <div key={option.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                                    <span className="flex-1">{t(option.label)}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteCompanyOption(option.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder={t('optionLabel')}
                                value={newCompanyLabel}
                                onChange={(e) => setNewCompanyLabel(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCompanyOption();
                                    }
                                }}
                            />
                            <Button onClick={addCompanyOption} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                {t('addOption')}
                            </Button>
                        </div>

                        <Button onClick={saveCompanyOptions} disabled={isLoading} className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            {t('saveChanges')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Position Options */}
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base">{t('positionOptions')}</CardTitle>
                        <CardDescription>{t('positionOptions')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {positionOptions.map((option) => (
                                <div key={option.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                                    <span className="flex-1">{t(option.label)}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deletePositionOption(option.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder={t('optionLabel')}
                                value={newPositionLabel}
                                onChange={(e) => setNewPositionLabel(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addPositionOption();
                                    }
                                }}
                            />
                            <Button onClick={addPositionOption} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                {t('addOption')}
                            </Button>
                        </div>

                        <Button onClick={savePositionOptions} disabled={isLoading} className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            {t('saveChanges')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
