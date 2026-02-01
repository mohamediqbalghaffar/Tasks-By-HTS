import { useState, useEffect, useRef } from 'react';

export const useScheduledBackup = (callback: () => void) => {
    const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('autoBackupEnabled');
            return saved === 'true';
        }
        return false;
    });

    const lastRunRef = useRef<string | null>(null);

    useEffect(() => {
        localStorage.setItem('autoBackupEnabled', String(isAutoBackupEnabled));
    }, [isAutoBackupEnabled]);

    useEffect(() => {
        if (!isAutoBackupEnabled) return;

        const checkTime = () => {
            const now = new Date();
            const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const hour = now.getHours();
            const minute = now.getMinutes();

            // Check if day is Sunday (0) through Thursday (4)
            if (day >= 0 && day <= 4) {
                // Check if time is 08:00 or 17:00
                if ((hour === 8 || hour === 17) && minute === 0) {
                    const timeKey = `${now.toDateString()}-${hour}:${minute}`;

                    // Ensure it runs only once per scheduled minute
                    if (lastRunRef.current !== timeKey) {
                        console.log('Running scheduled auto-backup:', timeKey);
                        callback();
                        lastRunRef.current = timeKey;
                    }
                }
            }
        };

        // Check every minute
        const intervalId = setInterval(checkTime, 60000); // 60 seconds

        // Initial check in case we load exactly on the minute
        checkTime();

        return () => clearInterval(intervalId);
    }, [isAutoBackupEnabled, callback]);

    const toggleAutoBackup = () => {
        setIsAutoBackupEnabled(prev => !prev);
    };

    return {
        isAutoBackupEnabled,
        toggleAutoBackup
    };
};
