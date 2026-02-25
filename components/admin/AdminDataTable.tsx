import React from 'react';
import { Asset, Vehicle } from '../../types';
import { Edit, Trash2, Check, X } from 'lucide-react';

interface AdminDataTableProps {
    activeTab: 'assets' | 'vehicles';
    data: (Asset | Vehicle)[];
    editingId: string | null;
    editValues: { field1: string; field2: string; field3?: string; field4?: string; field5?: string };
    onStartEdit: (item: Asset | Vehicle) => void;
    onCancelEdit: () => void;
    onSaveEdit: (oldId: string) => void;
    onDeleteItem: (id: string) => void;
    onEditValueChange: (field: string, value: string) => void;
    getAssetId: (a: Asset) => string;
}

export const AdminDataTable: React.FC<AdminDataTableProps> = ({
    activeTab,
    data,
    editingId,
    editValues,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDeleteItem,
    onEditValueChange,
    getAssetId
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase w-32">
                            {activeTab === 'assets' ? 'Cód. Fiscal' : 'Placa'}
                        </th>
                        {activeTab === 'assets' && (
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase w-48">Patrimônio</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                            {activeTab === 'assets' ? 'Descrição' : 'Modelo'}
                        </th>
                        {activeTab === 'vehicles' && (
                            <>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase w-48">Unidade</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase w-48">Setor</th>
                            </>
                        )}
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase w-32">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, idx) => {
                        const id = activeTab === 'assets' ? getAssetId(item as Asset) : (item as Vehicle).plate;
                        const val1 = activeTab === 'assets' ? (item as Asset).fiscalCode : (item as Vehicle).plate;
                        const val2 = activeTab === 'assets' ? (item as Asset).patrimony : (item as Vehicle).model;
                        const val3 = activeTab === 'assets' ? (item as Asset).description : (item as Vehicle).unit;
                        const val4 = activeTab === 'vehicles' ? (item as Vehicle).sector : undefined;
                        const isEditing = editingId === id;

                        return (
                            <tr key={idx} className={`${isEditing ? 'bg-blue-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                                <td className="px-6 py-3 text-sm">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full border p-1 rounded font-mono uppercase bg-white text-slate-900"
                                            value={editValues.field1}
                                            onChange={e => onEditValueChange('field1', e.target.value)}
                                        />
                                    ) : (
                                        <span className="font-mono text-slate-900">{val1}</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-sm">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full border p-1 rounded bg-white text-slate-900"
                                            value={editValues.field2}
                                            onChange={e => onEditValueChange('field2', e.target.value)}
                                        />
                                    ) : (
                                        <span className="text-slate-700">{val2}</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-sm">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full border p-1 rounded bg-white text-slate-900"
                                            value={editValues.field3}
                                            onChange={e => onEditValueChange('field3', e.target.value)}
                                        />
                                    ) : (
                                        <span className="text-slate-700">{val3}</span>
                                    )}
                                </td>
                                {activeTab === 'vehicles' && (
                                    <td className="px-6 py-3 text-sm">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="w-full border p-1 rounded bg-white text-slate-900"
                                                value={editValues.field4}
                                                onChange={e => onEditValueChange('field4', e.target.value)}
                                            />
                                        ) : (
                                            <span className="text-slate-700">{val4}</span>
                                        )}
                                    </td>
                                )}
                                <td className="px-6 py-3 text-right space-x-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => onSaveEdit(id)}
                                                className="text-emerald-600 hover:text-emerald-800 p-1"
                                                title="Salvar"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={onCancelEdit}
                                                className="text-slate-400 hover:text-slate-600 p-1"
                                                title="Cancelar"
                                            >
                                                <X size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => onStartEdit(item)}
                                                className="text-blue-500 hover:text-blue-700 p-1"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDeleteItem(id)}
                                                className="text-gray-400 hover:text-red-600 p-1"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {data.length === 0 && (
                <div className="p-10 text-center text-slate-400 text-sm">Nenhum registro encontrado.</div>
            )}
        </div>
    );
};
