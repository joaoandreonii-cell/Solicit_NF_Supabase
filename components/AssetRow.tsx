import React from 'react';
import { Asset, SelectedAsset } from '../types';
import { Trash2 } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';

interface AssetRowProps {
  item: SelectedAsset;
  assets: Asset[];
  onUpdate: (id: string, field: keyof SelectedAsset, value: string | number) => void;
  onRemove: (id: string) => void;
}

export const AssetRow: React.FC<AssetRowProps> = ({ item, assets, onUpdate, onRemove }) => {
  const assetOptions = React.useMemo(() => assets.map(a => ({
    value: a.fiscalCode,
    label: a.description,
    subLabel: `${a.fiscalCode} | ${a.patrimony}`
  })), [assets]);

  return (
    <div className="flex flex-col p-3 border rounded-lg bg-white shadow-sm mb-2 border-slate-200">

      {/* Top Row: Description (Searchable) */}
      <div className="w-full mb-2">
        <label htmlFor={`asset-desc-${item.id}`} className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
        <SearchableSelect
          id={`asset-desc-${item.id}`}
          options={assetOptions}
          value={item.assetFiscalCode}
          onChange={(val) => onUpdate(item.id, 'assetFiscalCode', val)}
          placeholder="Digite para buscar..."
          className="w-full"
          inputClassName="sm:text-sm h-9"
        />
      </div>

      {/* Bottom Row: Code (Auto) + Qty + Delete */}
      <div className="flex items-end gap-2">

        {/* Code Display */}
        <div className="flex-grow">
          <label htmlFor={`asset-code-${item.id}`} className="block text-xs font-semibold text-slate-700 mb-1">Cód. Fiscal</label>
          <input
            type="text"
            id={`asset-code-${item.id}`}
            value={item.assetFiscalCode}
            readOnly
            disabled
            className="w-full bg-slate-100 text-slate-600 border border-gray-300 rounded-md sm:text-sm p-2 cursor-not-allowed h-9"
            placeholder="-"
          />
        </div>

        {/* Quantity */}
        <div className="w-20">
          <label htmlFor={`asset-qty-${item.id}`} className="block text-xs font-semibold text-slate-700 mb-1">Qtd.</label>
          <input
            type="number"
            id={`asset-qty-${item.id}`}
            min="1"
            value={item.quantity}
            onChange={(e) => onUpdate(item.id, 'quantity', parseInt(e.target.value) || 0)}
            className="w-full bg-white text-slate-900 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 h-9"
          />
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="bg-red-50 text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-md transition-colors h-9 w-9 flex items-center justify-center border border-red-100"
          title="Remover item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};