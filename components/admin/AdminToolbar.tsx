import React from 'react';
import { Search, Download, Upload, Trash2, RotateCw } from 'lucide-react';

interface AdminToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    activeTab: 'assets' | 'vehicles';
    onImportClick: () => void;
    onExport: () => void;
    onDeleteAll: () => void;
    onResync: () => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
    searchTerm,
    onSearchChange,
    activeTab,
    onImportClick,
    onExport,
    onDeleteAll,
    onResync
}) => {
    return (
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
            <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder={`Buscar...`}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 block w-full rounded-md border-gray-300 bg-slate-50 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button
                    onClick={onResync}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-100"
                    title="Forçar sincronização total com a nuvem"
                >
                    <RotateCw size={18} /> Resync
                </button>
                <button
                    onClick={onImportClick}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 text-sm font-medium transition-colors"
                >
                    <Download size={16} /> <span className="hidden sm:inline">Importar</span>
                </button>
                <button
                    onClick={onExport}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                    <Upload size={16} /> <span className="hidden sm:inline">Exportar</span>
                </button>
                <button
                    onClick={onDeleteAll}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    <Trash2 size={16} /> <span className="hidden sm:inline">Limpar</span>
                </button>
            </div>
        </div>
    );
};
