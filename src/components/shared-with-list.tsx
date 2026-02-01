'use client';

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
}

export const SharedWithList: React.FC<SharedWithListProps> = ({ itemId, itemType }) => {
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
        <div className="mt-6 border rounded-lg p-4 bg-card">
            <h4 className="flex items-center gap-2 font-semibold text-sm mb-3 text-muted-foreground">
                <Users className="h-4 w-4" />
                {t('sharedWith')}
            </h4>
            <ScrollArea className="max-h-[200px]">
                <div className="space-y-3">
                    {sharedUsers.map(user => (
                        <div key={user.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src={user.photoURL} />
                                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {user.sharedAt?.toDate ? formatDistanceToNow(user.sharedAt.toDate(), { addSuffix: true, locale: getDateFnsLocale() }) : 'Just now'}
                                    </p>
                                </div>
                            </div>
                            {user.lastSeen?.toDate && (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                                    <Eye className="h-3 w-3" />
                                    <span>{formatDistanceToNow(user.lastSeen.toDate(), { addSuffix: true, locale: getDateFnsLocale() })}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
