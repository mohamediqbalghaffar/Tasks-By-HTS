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
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-gray-300 dark:border-gray-700">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback className="font-semibold bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold leading-none text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                        {user.sharedAt?.toDate ? formatDistanceToNow(user.sharedAt.toDate(), { addSuffix: true, locale: getDateFnsLocale() }) : 'Just now'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {user.lastSeen?.toDate && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{formatDistanceToNow(user.lastSeen.toDate(), { addSuffix: true, locale: getDateFnsLocale() })}</span>
                    </div>
                )}
                {onUnshare && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 min-h-[36px] sm:h-8 sm:min-h-[32px] text-xs font-semibold px-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
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
        <div className="mt-6 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <h4 className="flex items-center gap-2 font-bold text-sm mb-4 text-gray-900 dark:text-white">
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
