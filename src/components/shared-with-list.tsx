'use client';

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Eye } from 'lucide-react';

interface SharedUser {
    uid: string;
    name: string;
    photoURL?: string;
    sharedAt: Timestamp;
    lastSeen?: Timestamp;
}

interface SharedWithListProps {
    itemId: string;
    itemType: 'task' | 'letter';
    onUnshare?: (itemId: string, itemType: 'task' | 'letter', targetUserId: string) => Promise<boolean>;
}

const SharedUserItem: React.FC<{
    user: SharedUser;
    itemId: string;
    itemType: 'task' | 'letter';
    t: (key: string) => string;
    getDateFnsLocale: () => any;
    onUnshare?: (itemId: string, itemType: 'task' | 'letter', targetUserId: string) => Promise<boolean>;
    onUnshareComplete: (userId: string) => void;
}> = ({ user, itemId, itemType, t, getDateFnsLocale, onUnshare, onUnshareComplete }) => {
    const [isUnsharing, setIsUnsharing] = useState(false);

    const handleUnshare = async () => {
        if (!onUnshare) return;
        setIsUnsharing(true);
        const success = await onUnshare(itemId, itemType, user.uid);
        if (success) {
            onUnshareComplete(user.uid);
        }
        setIsUnsharing(false);
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 border border-transparent hover:border-border/50">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback className="font-semibold">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
                    <p className="text-xs text-foreground/70 dark:text-foreground/80 mt-1.5">
                        {user.sharedAt?.toDate ? formatDistanceToNow(user.sharedAt.toDate(), { addSuffix: true, locale: getDateFnsLocale() }) : 'Just now'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {user.lastSeen?.toDate && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1.5 rounded-full">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{formatDistanceToNow(user.lastSeen.toDate(), { addSuffix: true, locale: getDateFnsLocale() })}</span>
                    </div>
                )}
                {onUnshare && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 min-h-[36px] sm:h-8 sm:min-h-[32px] text-xs font-semibold px-3 text-destructive hover:text-destructive hover:bg-destructive/15 border border-transparent hover:border-destructive/20"
                        onClick={handleUnshare}
                        disabled={isUnsharing}
                    >
                        {isUnsharing ? t('loading') : t('cancelSharing')}
                    </Button>
                )}
            </div>
        </div>
    );
};

export const SharedWithList: React.FC<SharedWithListProps> = ({ itemId, itemType, onUnshare }) => {
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const { t, getDateFnsLocale } = useLanguage();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!itemId || !currentUser?.uid || !db) return;

        const collectionName = itemType === 'task' ? 'tasks' : 'approvalLetters';
        const sharesRef = collection(db, 'users', currentUser.uid, collectionName, itemId, 'shares');
        const q = query(sharesRef, orderBy('sharedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            })) as SharedUser[];
            setSharedUsers(users);
        });

        return () => unsubscribe();
    }, [itemId, itemType, currentUser]);

    if (sharedUsers.length === 0) return null;

    return (
        <div className="mt-6 border-2 rounded-lg p-4 bg-card">
            <h4 className="flex items-center gap-2 font-bold text-sm mb-4 text-foreground/80">
                <Users className="h-4 w-4" />
                {t('sharedWith')}
            </h4>
            <ScrollArea className="max-h-[200px]">
                <div className="space-y-3">
                    {sharedUsers.map(user => (
                        <SharedUserItem
                            key={user.uid}
                            user={user}
                            itemId={itemId}
                            itemType={itemType}
                            t={t}
                            getDateFnsLocale={getDateFnsLocale}
                            onUnshare={onUnshare}
                            onUnshareComplete={(uid) => setSharedUsers(prev => prev.filter(u => u.uid !== uid))}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
