import React from 'react';
import { HistoryItem } from '../types';
import { Star, X, MapPin, Building2 } from 'lucide-react';

interface FavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    favorites: HistoryItem[];
    onLoad: (item: HistoryItem) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
    isOpen,
    onClose,
    favorites,
    onLoad
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Star className="text-amber-500 fill-amber-500" size={20} />
                        <h2 className="text-xl font-bold text-slate-800">Modelos Favoritos</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 flex-1 bg-slate-50">
                    {favorites.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <Star size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Você ainda não salvou nenhum modelo favorito.</p>
                            <p className="text-sm mt-2">Favorite suas solicitações frequentes para acessá-las rapidamente.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {favorites.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative">
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                            <Building2 size={16} className="text-blue-500" />
                                            {item.formData.workName || 'Obra não informada'}
                                        </h3>
                                        <div className="text-sm text-slate-600 mt-1 ml-6">
                                            <p className="flex items-center gap-1.5 mb-1 text-slate-500 italic">
                                                <MapPin size={12} />
                                                {item.formData.destinationCity || 'Destino não informado'}
                                            </p>
                                            <p>Motorista: {item.formData.driverName || '-'}</p>
                                            <p>Veículo: {item.formData.vehiclePlate || '-'}</p>
                                            <p>Itens: {item.selectedAssets.length}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                                        <button
                                            onClick={() => {
                                                onLoad(item);
                                                onClose();
                                            }}
                                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors font-medium"
                                        >
                                            Usar Modelo
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
