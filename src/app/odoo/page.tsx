
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOdooApprovals, type OdooCredentials } from '@/lib/odoo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { translations, type Locale } from '@/lib/translations';
import Link from 'next/link';
import { Home, ServerIcon, LogOut, Eye, EyeOff, CheckCircle, ExternalLink, List, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface OdooApproval {
    id: number;
    name: string;
    'category_id': [number, string];
    'request_owner_id': [number, string];
    'date_start': string;
}

const LOCAL_STORAGE_KEY_ODOO_CREDS = 'odoo_credentials_v1';
const ODOO_DASHBOARD_URL = "https://erp.halabjagroup.com/web?debug=assets#model=approval.request&view_type=kanban&menu_id=588&cids=86%2C87%2C88%2C89";


export default function OdooPage() {
    const [approvals, setApprovals] = useState<OdooApproval[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<Locale>('ku');
    const [isConnected, setIsConnected] = useState(false);

    const [creds, setCreds] = useState<OdooCredentials>({
        url: '',
        db: '',
        username: '',
        apiKey: ''
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const { toast } = useToast();


    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        const translation = translations[language]?.[key] || translations['ku']?.[key] || key;
        if (params) {
            return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
                return acc.replace(`{${paramKey}}`, String(paramValue));
            }, translation);
        }
        return translation;
    }, [language]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCreds(prev => ({ ...prev, [name]: value }));
    };

    const handleFetchApprovals = useCallback(async (credentials: OdooCredentials) => {
        if (!credentials.url || !credentials.db || !credentials.username || !credentials.apiKey) {
            setError(t('odooCredsRequired'));
            setIsLoading(false);
            setIsConnected(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const odooApprovals = await getOdooApprovals(credentials);
            setApprovals(odooApprovals);
            setIsConnected(true);
            localStorage.setItem(LOCAL_STORAGE_KEY_ODOO_CREDS, JSON.stringify(credentials));
            if (odooApprovals.length > 0) {
                toast({ title: t('odooConnectSuccessTitle'), description: t('showingOdooItems', { count: odooApprovals.length }) });
            } else {
                toast({ title: t('odooConnectSuccessTitle'), description: t('noOdooItems') });
            }
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
            setIsConnected(false);
            localStorage.removeItem(LOCAL_STORAGE_KEY_ODOO_CREDS);
            toast({ title: t('errorLoadingOdooTitle'), description: e.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [t, toast]);

    useEffect(() => {
        const storedLang = localStorage.getItem('taskmaster_language_v1') as Locale | null;
        if (storedLang && ['ku', 'ar'].includes(storedLang)) {
            setLanguage(storedLang);
        }

        const storedCreds = localStorage.getItem(LOCAL_STORAGE_KEY_ODOO_CREDS);
        if (storedCreds) {
            const parsedCreds = JSON.parse(storedCreds);
            setCreds(parsedCreds);
            handleFetchApprovals(parsedCreds);
        } else {
            setIsLoading(false);
        }
    }, [handleFetchApprovals]);


    const handleDisconnect = () => {
        setCreds({ url: '', db: '', username: '', apiKey: '' });
        setApprovals([]);
        setIsConnected(false);
        setError(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY_ODOO_CREDS);
        toast({ title: t('odooDisconnectSuccess') });
    }

    if (isLoading && !isConnected) { // Only show full-page spinner on initial load
        return <LoadingSpinner message={t('loadingOdooApprovals') || 'Loading Odoo Data...'} />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-4xl">
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {isConnected && (
                                    <Button variant="outline" size="icon" onClick={() => handleFetchApprovals(creds)} title={t('refresh')}>
                                        <RotateCcw className="h-5 w-5" />
                                    </Button>
                                )}
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <List className="h-6 w-6" />
                                        {t('odooRemoteAdmin')}
                                    </CardTitle>
                                    <CardDescription>{isConnected ? t('odooItemListDesc') : t('odooConnectPrompt')}</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isConnected && (
                                    <Button variant="outline" onClick={handleDisconnect}>
                                        <LogOut className="mr-2 h-4 w-4" /> {t('odooDisconnect')}
                                    </Button>
                                )}
                                <Link href={ODOO_DASHBOARD_URL} passHref legacyBehavior>
                                    <a target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline">
                                            <ExternalLink className="mr-2 h-4 w-4" /> {t('odooDashboard')}
                                        </Button>
                                    </a>
                                </Link>
                                <Link href="/">
                                    <Button variant="outline"><Home className="mr-2 h-4 w-4" /> {t('home')}</Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!isConnected ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="url">{t('odooUrlLabel')}</Label>
                                    <Input id="url" name="url" value={creds.url} onChange={handleInputChange} placeholder="https://your-odoo-instance.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="db">{t('odooDbLabel')}</Label>
                                    <Input id="db" name="db" value={creds.db} onChange={handleInputChange} placeholder="your_database_name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">{t('odooUsernameLabel')}</Label>
                                    <Input id="username" name="username" value={creds.username} onChange={handleInputChange} placeholder="your_odoo_username_or_email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apiKey">{t('odooApiKeyLabel')}</Label>
                                    <div className="relative">
                                        <Input id="apiKey" name="apiKey" type={showApiKey ? 'text' : 'password'} value={creds.apiKey} onChange={handleInputChange} placeholder="your_odoo_api_key_or_password" />
                                        <Button variant="ghost" size="icon" className="absolute bottom-1 left-1 h-7 w-7" onClick={() => setShowApiKey(!showApiKey)}>
                                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                {error && (
                                    <div className="text-center text-destructive p-4 bg-destructive/10 rounded-md">
                                        <p>{error}</p>
                                    </div>
                                )}
                                <Button className="w-full btn-gradient" onClick={() => handleFetchApprovals(creds)} disabled={isLoading}>
                                    {isLoading ? t('odooConnecting') : t('odooConnectButton')}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <LoadingSpinner message={t('loadingOdooApprovals')} />
                                    </div>
                                ) : approvals.length > 0 ? (
                                    <ul className="space-y-3">
                                        {approvals.map(approval => (
                                            <li key={approval.id} className="p-4 border rounded-md shadow-sm bg-card/80 hover:bg-accent/50 transition-colors">
                                                <h3 className="font-semibold text-lg">{approval.name}</h3>
                                                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                                    <p><strong>{t('odooApprovalCategory')}:</strong> {approval.category_id[1]}</p>
                                                    <p><strong>{t('sharedByLabel')}:</strong> {approval.request_owner_id[1]}</p>
                                                    <p><strong>{t('sharedDateLabel')}:</strong> {format(new Date(approval.date_start), 'PPP')}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">{t('noOdooItems')}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                    {isConnected && !isLoading && (
                        <CardFooter>
                            <div className="w-full p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-medium">
                                    {t('odooConnectSuccessDesc')} {t('showingOdooItems', { count: approvals.length })}
                                </p>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}
