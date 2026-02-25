import React from 'react';
import { Plus, Save } from 'lucide-react';
import { Asset, Vehicle } from '../../types';

interface AdminManualAddProps {
    activeTab: 'assets' | 'vehicles';
    newAsset: Asset;
    setNewAsset: (a: Asset) => void;
    newVehicle: Vehicle;
    setNewVehicle: (v: Vehicle) => void;
    onAdd: () => void;
}

export const AdminManualAdd: React.FC<AdminManualAddProps> = ({
    activeTab,
    newAsset,
    setNewAsset,
    newVehicle,
    setNewVehicle,
    onAdd
}) => {
    const inputStyle = "bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 placeholder-slate-400 outline-none transition-all";

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 font-sans">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Plus size={14} /> Adicionar Manualmente
            </h3>
            {activeTab === 'assets' ? (
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Código Fiscal"
                        className={`${inputStyle} w-full md:w-48 text-slate-900`}
                        value={newAsset.fiscalCode}
                        onChange={e => setNewAsset({ ...newAsset, fiscalCode: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Patrimônio"
                        className={`${inputStyle} w-full md:w-48 text-slate-900`}
                        value={newAsset.patrimony}
                        onChange={e => setNewAsset({ ...newAsset, patrimony: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Descrição"
                        className={`${inputStyle} w-full md:flex-1 text-slate-900`}
                        value={newAsset.description}
                        onChange={e => setNewAsset({ ...newAsset, description: e.target.value })}
                    />
                    <button
                        onClick={onAdd}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center"
                    >
                        <Save size={18} />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Placa"
                        className={`${inputStyle} w-full md:w-48 text-slate-900`}
                        value={newVehicle.plate}
                        onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Modelo"
                        className={`${inputStyle} w-full md:flex-1 text-slate-900`}
                        value={newVehicle.model}
                        onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Unidade"
                        className={`${inputStyle} w-full md:w-48 text-slate-900`}
                        value={newVehicle.unit}
                        onChange={e => setNewVehicle({ ...newVehicle, unit: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Setor"
                        className={`${inputStyle} w-full md:w-48 text-slate-900`}
                        value={newVehicle.sector}
                        onChange={e => setNewVehicle({ ...newVehicle, sector: e.target.value })}
                    />
                    <button
                        onClick={onAdd}
                        className="grow-0 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center h-10 self-end md:self-auto"
                    >
                        <Save size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};
