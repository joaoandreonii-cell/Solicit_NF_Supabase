import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import { Asset, Vehicle } from '../types';
import { useSync } from '../hooks/useSync';
import {
  Trash2,
  Upload,
  Download,
  Database,
  LogIn,
  Plus,
  Save,
  Search,
  AlertTriangle,
  X,
  FileJson,
  FileSpreadsheet,
  Edit,
  Check
} from 'lucide-react';

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
  onLogin
}) => {
  const { user } = useAuth();
  const { clearRemoteStorage } = useSync();
  // --- Auth State ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Panel State ---
  const [activeTab, setActiveTab] = useState<'assets' | 'vehicles'>('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- New Item State ---
  const [newAsset, setNewAsset] = useState<Asset>({ fiscalCode: '', patrimony: '', description: '' });
  const [newVehicle, setNewVehicle] = useState<Vehicle>({ plate: '', model: '', unit: '', sector: '' });

  // --- Edit State ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ field1: string; field2: string; field3?: string; field4?: string; field5?: string }>({ field1: '', field2: '', field3: '', field4: '', field5: '' });

  // ---------------------------------------------------------------------------
  // AUTHENTICATION LOGIC
  // ---------------------------------------------------------------------------
  // No local login logic needed as we use Supabase Auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would check for an 'admin' role in the user metadata or a specific table.
    // For now, we will trust the isAuthenticated prop from App.tsx which is set via AuthContext.
    onLogin();
  };

  // ---------------------------------------------------------------------------
  // DATA HELPERS
  // ---------------------------------------------------------------------------
  const normalizeKey = (key: string) =>
    key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase().trim();

  const getFilteredData = () => {
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

  // ---------------------------------------------------------------------------
  // EDIT LOGIC
  // ---------------------------------------------------------------------------
  const startEditing = (id: string, val1: string, val2: string, val3?: string, val4?: string, val5?: string) => {
    setEditingId(id);
    setEditValues({ field1: val1, field2: val2, field3: val3 || '', field4: val4 || '', field5: val5 || '' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({ field1: '', field2: '', field3: '', field4: '', field5: '' });
  };

  const saveEdit = (oldId: string) => {
    const { field1, field2, field3, field4, field5 } = editValues;

    if (!field1.trim() || !field2.trim()) {
      alert("Os campos obrigatórios não podem estar vazios.");
      return;
    }

    if (activeTab === 'assets') {
      // Check for duplicate fiscalCode (excluding current)
      if (field1 !== oldId && assets.some(a => a.fiscalCode === field1)) {
        alert("Já existe um item com este código fiscal!");
        return;
      }
      const updated = assets.map(a => a.fiscalCode === oldId ? { fiscalCode: field1, patrimony: field2, description: field3 } : a);
      onAssetsChange(updated);
    } else {
      // Check for duplicate plate (excluding current)
      if (field1 !== oldId && vehicles.some(v => v.plate === field1)) {
        alert("Já existe um veículo com esta placa!");
        return;
      }
      const updated = vehicles.map(v => v.plate === oldId ? { plate: field1, model: field2, unit: field3 || '', sector: field4 || '' } : v);
      onVehiclesChange(updated);
    }

    setEditingId(null);
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: IMPORT / EXPORT / DELETE / ADD
  // ---------------------------------------------------------------------------

  const handleExport = () => {
    const dataToExport = activeTab === 'assets' ? assets : vehicles;
    if (dataToExport.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }
    const formattedData = activeTab === 'assets'
      ? (dataToExport as Asset[]).map(a => ({ "Código Fiscal": a.fiscalCode, "Patrimônio": a.patrimony, "Descrição": a.description }))
      : (dataToExport as Vehicle[]).map(v => ({ "Placa": v.plate, "Modelo": v.model, "Unidade": v.unit, "Setor": v.sector }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'assets' ? "Imobilizados" : "Veículos");
    XLSX.writeFile(wb, `${activeTab === 'assets' ? 'imobilizados' : 'veiculos'}_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        if (!Array.isArray(jsonData)) throw new Error("Arquivo inválido.");

        if (activeTab === 'assets') {
          const mappedAssets: Asset[] = [];
          jsonData.forEach((row: any) => {
            const normalizedRow: Record<string, any> = {};
            Object.keys(row).forEach(k => normalizedRow[normalizeKey(k)] = row[k]);

            const fCode = normalizedRow['codigofiscal'] || normalizedRow['fiscalcode'] || normalizedRow['codigo'] || normalizedRow['code'] || normalizedRow['imobilizado'] || normalizedRow['ativo'] || normalizedRow['id'];
            const patrimony = normalizedRow['patrimonio'] || normalizedRow['patrimony'] || '-';
            const desc = normalizedRow['descricao'] || normalizedRow['description'] || normalizedRow['desc'] || normalizedRow['item'] || normalizedRow['nome'] || normalizedRow['produto'];

            if (fCode && desc) {
              mappedAssets.push({
                fiscalCode: String(fCode).trim(),
                patrimony: String(patrimony).trim(),
                description: String(desc).trim()
              });
            } else if (!fCode && desc && patrimony !== '-') {
              // Use patrimony as fiscalCode if code is missing but patrimony is present
              mappedAssets.push({
                fiscalCode: String(patrimony).trim(),
                patrimony: String(patrimony).trim(),
                description: String(desc).trim()
              });
            }
          });

          if (mappedAssets.length === 0) {
            alert("Nenhum item válido encontrado. Verifique se os cabeçalhos da planilha estão corretos (ex: Código Fiscal, Descrição).");
            return;
          }

          if (confirm(`Importar ${mappedAssets.length} imobilizados? (Dados existentes serão preservados e atualizados)`)) {
            // Merge logic: maintain existing assets and update/add imported ones
            const existingMap = new Map(assets.map(a => [a.fiscalCode, a]));
            mappedAssets.forEach(a => existingMap.set(a.fiscalCode, a));
            onAssetsChange(Array.from(existingMap.values()));
          }
        } else {
          const mappedVehicles: Vehicle[] = [];
          jsonData.forEach((row: any) => {
            const normalizedRow: Record<string, any> = {};
            Object.keys(row).forEach(k => normalizedRow[normalizeKey(k)] = row[k]);
            const plate = normalizedRow['placa'] || normalizedRow['plate'] || normalizedRow['veiculo'];
            const model = normalizedRow['modelo'] || normalizedRow['model'] || normalizedRow['descricao'];
            const unit = normalizedRow['unidade'] || normalizedRow['unit'] || '-';
            const sector = normalizedRow['setor'] || normalizedRow['sector'] || '-';
            if (plate && model) mappedVehicles.push({ plate: String(plate).trim(), model: String(model).trim(), unit: String(unit).trim(), sector: String(sector).trim() });
          });

          if (mappedVehicles.length === 0) {
            alert("Nenhum veículo válido encontrado. Verifique se os cabeçalhos da planilha estão corretos (ex: Placa, Modelo).");
            return;
          }

          if (confirm(`Importar ${mappedVehicles.length} veículos? (Dados existentes serão preservados e atualizados)`)) {
            const existingMap = new Map(vehicles.map(v => [v.plate, v]));
            mappedVehicles.forEach(v => existingMap.set(v.plate, v));
            onVehiclesChange(Array.from(existingMap.values()));
          }
        }
      } catch (error) {
        alert("Erro ao ler arquivo Excel.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteAll = () => {
    const label = activeTab === 'assets' ? 'imobilizados' : 'veículos';
    if (confirm(`PERIGO: Isso apagará TODOS os ${label} do banco de dados.`)) {
      if (activeTab === 'assets') {
        onAssetsChange([]);
        clearRemoteStorage('assets');
      } else {
        onVehiclesChange([]);
        clearRemoteStorage('vehicles');
      }
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm("Excluir este item?")) return;
    if (activeTab === 'assets') {
      if (onDeleteAsset) onDeleteAsset(id);
      else onAssetsChange(assets.filter(a => a.fiscalCode !== id));
    } else {
      if (onDeleteVehicle) onDeleteVehicle(id);
      else onVehiclesChange(vehicles.filter(v => v.plate !== id));
    }
  };

  const handleAddManual = () => {
    if (activeTab === 'assets') {
      if (!newAsset.fiscalCode || !newAsset.description) return alert("Preencha Código Fiscal e Descrição");
      if (assets.some(a => a.fiscalCode === newAsset.fiscalCode)) return alert("Já existe este código fiscal!");
      onAssetsChange([...assets, newAsset]);
      setNewAsset({ fiscalCode: '', patrimony: '', description: '' });
    } else {
      if (!newVehicle.plate || !newVehicle.model) return alert("Preencha Placa e Modelo");
      if (vehicles.some(v => v.plate === newVehicle.plate)) return alert("Já existe esta placa!");
      onVehiclesChange([...vehicles, newVehicle]);
      setNewVehicle({ plate: '', model: '', unit: '', sector: '' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-70 px-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full shadow-inner">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Acesso Administrativo</h2>
          <p className="text-center text-slate-500 mb-6 text-sm">Gerencie o banco de dados</p>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800">
              O acesso ao Painel Administrativo requer privilégios elevados.
              Clique no botão abaixo para confirmar seu acesso como administrador.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button
              onClick={() => {
                if (user?.email_verified === false) {
                  alert("Por favor, verifique seu email antes de acessar o painel.");
                  return;
                }
                onLogin();
              }}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Acessar Painel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredList = getFilteredData();

  const inputStyle = "bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 placeholder-slate-400 outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-75 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md"><Database className="h-6 w-6" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Banco de Dados</h2>
              <p className="text-xs text-slate-500">Gerencie os registros do aplicativo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'assets' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`} onClick={() => { setActiveTab('assets'); setSearchTerm(''); cancelEditing(); }}>Imobilizados <span className="ml-2 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{assets.length}</span></button>
          <button className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'vehicles' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`} onClick={() => { setActiveTab('vehicles'); setSearchTerm(''); cancelEditing(); }}>Veículos <span className="ml-2 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{vehicles.length}</span></button>
        </div>

        {/* TOOLBAR */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
            <input type="text" placeholder={`Buscar...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 block w-full rounded-md border-gray-300 bg-slate-50 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button onClick={handleImportClick} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 text-sm font-medium"><Download size={16} /> <span className="hidden sm:inline">Importar</span></button>
            <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"><Upload size={16} /> <span className="hidden sm:inline">Exportar</span></button>
            <button onClick={handleDeleteAll} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium"><Trash2 size={16} /> <span className="hidden sm:inline">Limpar</span></button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          {/* ADD MANUAL */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Plus size={14} /> Adicionar Manualmente</h3>
            {activeTab === 'assets' ? (
              <div className="flex flex-col md:flex-row gap-3">
                <input type="text" placeholder="Código Fiscal" className={`${inputStyle} w-full md:w-48`} value={newAsset.fiscalCode} onChange={e => setNewAsset({ ...newAsset, fiscalCode: e.target.value })} />
                <input type="text" placeholder="Patrimônio" className={`${inputStyle} w-full md:w-48`} value={newAsset.patrimony} onChange={e => setNewAsset({ ...newAsset, patrimony: e.target.value })} />
                <input type="text" placeholder="Descrição" className={`${inputStyle} w-full md:flex-1`} value={newAsset.description} onChange={e => setNewAsset({ ...newAsset, description: e.target.value })} />
                <button onClick={handleAddManual} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center"><Save size={18} /></button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-3">
                <input type="text" placeholder="Placa" className={`${inputStyle} w-full md:w-48`} value={newVehicle.plate} onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })} />
                <input type="text" placeholder="Modelo" className={`${inputStyle} w-full md:flex-1`} value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                <input type="text" placeholder="Unidade" className={`${inputStyle} w-full md:w-48`} value={newVehicle.unit} onChange={e => setNewVehicle({ ...newVehicle, unit: e.target.value })} />
                <input type="text" placeholder="Setor" className={`${inputStyle} w-full md:w-48`} value={newVehicle.sector} onChange={e => setNewVehicle({ ...newVehicle, sector: e.target.value })} />
                <button onClick={handleAddManual} className="grow-0 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center h-10 self-end md:self-auto"><Save size={18} /></button>
              </div>
            )}
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase w-32">{activeTab === 'assets' ? 'Cód. Fiscal' : 'Placa'}</th>
                  {activeTab === 'assets' && (
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase w-48">Patrimônio</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">{activeTab === 'assets' ? 'Descrição' : 'Modelo'}</th>
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
                {filteredList.map((item, idx) => {
                  const id = activeTab === 'assets' ? (item as Asset).fiscalCode : (item as Vehicle).plate;
                  const val1 = activeTab === 'assets' ? (item as Asset).fiscalCode : (item as Vehicle).plate;
                  const val2 = activeTab === 'assets' ? (item as Asset).patrimony : (item as Vehicle).model;
                  const val3 = activeTab === 'assets' ? (item as Asset).description : (item as Vehicle).unit;
                  const val4 = activeTab === 'vehicles' ? (item as Vehicle).sector : undefined;
                  const isEditing = editingId === id;

                  return (
                    <tr key={idx} className={`${isEditing ? 'bg-blue-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="px-6 py-3 text-sm">
                        {isEditing ? (
                          <input type="text" className="w-full border p-1 rounded font-mono uppercase bg-white text-slate-900" value={editValues.field1} onChange={e => setEditValues({ ...editValues, field1: e.target.value })} />
                        ) : (
                          <span className="font-mono text-slate-900">{val1}</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {isEditing ? (
                          <input type="text" className="w-full border p-1 rounded bg-white text-slate-900" value={editValues.field2} onChange={e => setEditValues({ ...editValues, field2: e.target.value })} />
                        ) : (
                          <span className="text-slate-700">{val2}</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {isEditing ? (
                          <input type="text" className="w-full border p-1 rounded bg-white text-slate-900" value={editValues.field3} onChange={e => setEditValues({ ...editValues, field3: e.target.value })} />
                        ) : (
                          <span className="text-slate-700">{val3}</span>
                        )}
                      </td>
                      {activeTab === 'vehicles' && (
                        <td className="px-6 py-3 text-sm">
                          {isEditing ? (
                            <input type="text" className="w-full border p-1 rounded bg-white text-slate-900" value={editValues.field4} onChange={e => setEditValues({ ...editValues, field4: e.target.value })} />
                          ) : (
                            <span className="text-slate-700">{val4}</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-3 text-right space-x-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(id)} className="text-emerald-600 hover:text-emerald-800 p-1" title="Salvar"><Check size={18} /></button>
                            <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600 p-1" title="Cancelar"><X size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(id, val1, val2, val3, val4)} className="text-blue-500 hover:text-blue-700 p-1" title="Editar"><Edit size={18} /></button>
                            <button onClick={() => handleDeleteItem(id)} className="text-gray-400 hover:text-red-600 p-1" title="Excluir"><Trash2 size={18} /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredList.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">Nenhum registro encontrado.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};