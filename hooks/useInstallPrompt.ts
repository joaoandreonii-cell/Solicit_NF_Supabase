import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useInstallPrompt = () => {
    const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS Safari (no beforeinstallprompt — needs manual instructions)
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
            && !(window as any).MSStream;
        setIsIOS(ios);

        // Already running as installed PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setPromptEvent(e as BeforeInstallPromptEvent);
        };

        const handleInstalled = () => {
            setIsInstalled(true);
            setPromptEvent(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, []);

    const install = async () => {
        if (!promptEvent) return false;
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
            setPromptEvent(null);
            return true;
        }
        return false;
    };

    // Show banner when browser is ready to install OR on iOS (manual flow)
    const canInstall = !isInstalled && (promptEvent !== null || isIOS);

    return { canInstall, install, isIOS, isInstalled };
};
