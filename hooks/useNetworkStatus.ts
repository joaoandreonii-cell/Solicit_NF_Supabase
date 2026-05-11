import { useState, useEffect, useCallback } from 'react';

export const useNetworkStatus = (onReconnect?: () => void) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const stableReconnect = useCallback(() => {
        onReconnect?.();
    }, [onReconnect]);

    useEffect(() => {
        const handleOnline  = () => { setIsOnline(true); stableReconnect(); };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online',  handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online',  handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [stableReconnect]);

    return isOnline;
};
