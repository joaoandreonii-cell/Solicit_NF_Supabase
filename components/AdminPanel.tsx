import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Asset, Vehicle } from '../types';
import { useSync } from '../hooks/useSync';
import {
  Database,
  X
} from 'lucide-react';
import { LoginOverlay } from './admin/LoginOverlay';
import { AdminToolbar } from './admin/AdminToolbar';
import { AdminDataTable } from './admin/AdminDataTable';
import { AdminManualAdd } from './admin/AdminManualAdd';

interface AdminPanelProps {
  isOpen: boolean;
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
  onDeleteAsset?: (id: string) => void;
  vehicles: Vehicle[];
  onVehiclesChange: (vehicles: Vehicle[]) => void;
  onDeleteVehicle?: (plate: string) => void;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  onResync: () => void;
}

interface XLSXRow {
  [key: string]: string | number | boolean | null | undefined;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  assets,
  onAssetsChange,
  onDeleteAsset,
  vehicles,
  onVehiclesChange,
  onDeleteVehicle,
  onClose,
  isAuthenticated,
  onLogin,
  onResync
}) => {
  const { clearRemoteStorage } = useSync();

  // --- Panel State ---
  const [activeTab, setActiveTab] = useState<'assets' | 'vehicles'>('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- New Item State ---
  const [newAsset, setNewAsset] = useState<Asset>({ fiscalCode: '', patrimony: '', description: '' });
  const [newVehicle, setNewVehicle] = useState<Vehicle>({ plate: '', model: '', unit: '', sector: '' });

  // --- Edit State ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ field1: string; field2: string; field3?: string; field4?: string; field5?: string }>({
    field1: '', field2: '', field3: '', field4: '', field5: ''
  });

  // ---------------------------------------------------------------------------
  // DATA HELPERS
  // ---------------------------------------------------------------------------
  const normalizeKey = (key: string) =>
    key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase().trim();

  const getFilteredData = (): (Asset | Vehicle)[] => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'assets') {
      return assets.filter(a =>
        a.fiscalCode.toLowerCase().includes(term) ||
        a.patrimony.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term)
      );
    } else {
      return vehicles.filter(v =>
        v.plate.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term)
      );
    }
  };

  const getAssetId = (a: Asset) => `${a.fiscalCode}|${a.patrimony}`;

  // ---------------------------------------------------------------------------
  // EDIT LOGIC
  // ---------------------------------------------------------------------------
  const handleStartEdit = (item: Asset | Vehicle) => {
    if (activeTab === 'assets') {
      const a = item as Asset;
      setEditingId(getAssetId(a));
      setEditValues({ field1: a.fiscalCode, field2: a.patrimony, field3: a.description });
    } else {
      const v = item as Vehicle;
      setEditingId(v.plate);
      setEditValues({ field1: v.plate, field2: v.model, field3: v.unit, field4: v.sector });
    }
  };

  const handleSaveEdit = (oldId: string) => {
    const { field1, field2, field3, field4 } = editValues;

    if (!field1.trim() || !field2.trim()) {
      alert("Os campos obrigatórios não podem estar vazios.");
      return;
    }

    if (activeTab === 'assets') {
      const paddedPatrimony = field2.trim() ? field2.trim().padStart(4, '0') : '-';
      const updated = assets.map(a => getAssetId(a) === oldId ? { fiscalCode: field1, patrimony: paddedPatrimony, description: field3, updatedAt: new Date().toISOString() } : a);
      onAssetsChange(updated);
    } else {
      if (field1 !== oldId && vehicles.some(v => v.plate === field1)) {
        alert("Já existe um veículo com esta placa!");
        return;
      }
      const updated = vehicles.map(v => v.plate === oldId ? { plate: field1, model: field2, unit: field3 || '', sector: field4 || '', updatedAt: new Date().toISOString() } : v);
      onVehiclesChange(updated);
    }

    setEditingId(null);
  };

  // ---------------------------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------------------------
  const handleExport = () => {
    const dataToExport = activeTab === 'assets' ? assets : vehicles;
    if (dataToExport.length === 0) return alert("Não há dados para exportar.");

    const formattedData = activeTab === 'assets'
      ? (dataToExport as Asset[]).map(a => ({ "Código Fiscal": a.fiscalCode, "Patrimônio": a.patrimony, "Descrição": a.description }))
      : (dataToExport as Vehicle[]).map(v => ({ "Placa": v.plate, "Modelo": v.model, "Unidade": v.unit, "Setor": v.sector }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'assets' ? "Imobilizados" : "Veículos");
    XLSX.writeFile(wb, `${activeTab === 'assets' ? 'imobilizados' : 'veiculos'}_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        if (!workbook.SheetNames.length) throw new Error("O arquivo Excel parece estar vazio.");

        let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as XLSXRow[];

        if (activeTab === 'assets') {
          const mapped: Asset[] = jsonData.map(row => {
            const normalized: Record<string, any> = {};
            Object.keys(row).forEach(k => normalized[normalizeKey(k)] = row[k]);

            const fCode = normalized['codigofiscal'] || normalized['fiscalcode'] || normalized['codigo'] || normalized['code'];
            const patrimonyRaw = normalized['patrimonio'] || normalized['patrimony'];
            let patrimony = patrimonyRaw ? String(patrimonyRaw).trim().padStart(4, '0') : '-';
            const desc = normalized['descricao'] || normalized['description'] || normalized['desc'] || normalized['item'];

            return (fCode && desc) ? { fiscalCode: String(fCode).trim(), patrimony, description: String(desc).trim(), updatedAt: new Date().toISOString() } : null;
          }).filter(item => item !== null) as Asset[];

          if (confirm(`Importar ${mapped.length} imobilizados?`)) {
            const existingMap = new Map(assets.map(a => [getAssetId(a), a]));
            mapped.forEach(a => existingMap.set(getAssetId(a), a));
            onAssetsChange(Array.from(existingMap.values()));
          }
        } else {
          const mapped: Vehicle[] = jsonData.map(row => {
            const normalized: Record<string, any> = {};
            Object.keys(row).forEach(k => normalized[normalizeKey(k)] = row[k]);
            const plate = normalized['placa'] || normalized['plate'];
            const model = normalized['modelo'] || normalized['model'];
            return (plate && model) ? { plate: String(plate).trim(), model: String(model).trim(), unit: String(normalized['unidade'] || '-'), sector: String(normalized['setor'] || '-'), updatedAt: new Date().toISOString() } : null;
          }).filter(item => item !== null) as Vehicle[];

          if (confirm(`Importar ${mapped.length} veículos?`)) {
            const existingMap = new Map(vehicles.map(v => [v.plate, v]));
            mapped.forEach(v => existingMap.set(v.plate, v));
            onVehiclesChange(Array.from(existingMap.values()));
          }
        }
      } catch (error: any) {
        alert(`Erro ao processar arquivo: ${error.message}`);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddManual = () => {
    if (activeTab === 'assets') {
      if (!newAsset.fiscalCode || !newAsset.description) return alert("Preencha campos obrigatórios");
      const assetToAdd = { ...newAsset, patrimony: newAsset.patrimony.trim().padStart(4, '0'), updatedAt: new Date().toISOString() };
      if (assets.some(a => getAssetId(a) === getAssetId(assetToAdd))) return alert("Já existe!");
      onAssetsChange([...assets, assetToAdd]);
      setNewAsset({ fiscalCode: '', patrimony: '', description: '' });
    } else {
      if (!newVehicle.plate || !newVehicle.model) return alert("Preencha campos obrigatórios");
      onVehiclesChange([...vehicles, { ...newVehicle, updatedAt: new Date().toISOString() }]);
      setNewVehicle({ plate: '', model: '', unit: '', sector: '' });
    }
  };

  if (!isAuthenticated) return <LoginOverlay onLogin={onLogin} onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-75 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md"><Database className="h-6 w-6" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Banco de Dados</h2>
              <p className="text-xs text-slate-500">Gerencie os registros do aplicativo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50">
          <button className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'assets' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`} onClick={() => { setActiveTab('assets'); setSearchTerm(''); setEditingId(null); }}>Imobilizados <span className="ml-2 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{assets.length}</span></button>
          <button className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'vehicles' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`} onClick={() => { setActiveTab('vehicles'); setSearchTerm(''); setEditingId(null); }}>Veículos <span className="ml-2 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{vehicles.length}</span></button>
        </div>

        <AdminToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          onImportClick={() => fileInputRef.current?.click()}
          onExport={handleExport}
          onDeleteAll={() => {
            if (confirm(`PERIGO: Isso apagará TODOS os registros de ${activeTab === 'assets' ? 'imobilizados' : 'veículos'}.`)) {
              if (activeTab === 'assets') { onAssetsChange([]); clearRemoteStorage('assets'); }
              else { onVehiclesChange([]); clearRemoteStorage('vehicles'); }
            }
          }}
          onResync={onResync}
        />

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <AdminManualAdd
            activeTab={activeTab}
            newAsset={newAsset} setNewAsset={setNewAsset}
            newVehicle={newVehicle} setNewVehicle={setNewVehicle}
            onAdd={handleAddManual}
          />
          <AdminDataTable
            activeTab={activeTab}
            data={getFilteredData()}
            editingId={editingId}
            editValues={editValues}
            onStartEdit={handleStartEdit}
            onCancelEdit={() => setEditingId(null)}
            onSaveEdit={handleSaveEdit}
            onDeleteItem={(id) => {
              if (confirm("Excluir este item?")) {
                if (activeTab === 'assets') onDeleteAsset ? onDeleteAsset(id) : onAssetsChange(assets.filter(a => getAssetId(a) !== id));
                else onDeleteVehicle ? onDeleteVehicle(id) : onVehiclesChange(vehicles.filter(v => v.plate !== id));
              }
            }}
            onEditValueChange={(f, v) => setEditValues({ ...editValues, [f]: v })}
            getAssetId={getAssetId}
          />
        </div>
        <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
      </div>
    </div>
  );
};