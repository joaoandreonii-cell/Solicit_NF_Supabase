import { useState, useEffect } from 'react';
import { HistoryItem } from '../types';

export const useHistory = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('transport_app_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Error loading history:', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('transport_app_history', JSON.stringify(history));
    }, [history]);

    const saveToHistory = (newItem: HistoryItem) => {
        setHistory(prev => {
            const updated = [newItem, ...prev];
            return updated.slice(0, 50); // Keep only the 50 most recent
        });
    };

    const deleteHistoryItem = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    return {
        history,
        setHistory,
        saveToHistory,
        deleteHistoryItem
    };
};
