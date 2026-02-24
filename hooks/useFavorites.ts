import { useState, useEffect } from 'react';
import { HistoryItem } from '../types';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const savedFavorites = localStorage.getItem('transport_app_favorites');
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.error('Error loading favorites:', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('transport_app_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = (item: HistoryItem) => {
        setFavorites(prev => {
            if (prev.find(f => f.id === item.id)) return prev;
            return [item, ...prev];
        });
    };

    const removeFromFavorites = (id: string) => {
        setFavorites(prev => prev.filter(item => item.id !== id));
    };

    const isFavorite = (id: string) => {
        return favorites.some(item => item.id === id);
    };

    const toggleFavorite = (item: HistoryItem) => {
        if (isFavorite(item.id)) {
            removeFromFavorites(item.id);
        } else {
            addToFavorites(item);
        }
    };

    return {
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite
    };
};
