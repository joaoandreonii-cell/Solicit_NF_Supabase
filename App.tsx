import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/Auth/LoginScreen';
import { TripFormData, SelectedAsset, HistoryItem, Asset, Vehicle } from './types';
import { ASSETS as INITIAL_ASSETS, VEHICLES as INITIAL_VEHICLES } from './constants';
import { AssetRow } from './components/AssetRow';
import { HistoryModal } from './components/HistoryModal';
import { AdminPanel } from './components/AdminPanel';
import { SearchableSelect } from './components/SearchableSelect';
import { TripForm } from './components/TripForm';
import { MessagePreview } from './components/MessagePreview';
import {
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { useTripForm } from './hooks/useTripForm';
import { useHistory } from './hooks/useHistory';
import { useSync } from './hooks/useSync';
import { Analytics } from '@vercel/analytics/react';

const getInitialForm = (): TripFormData => ({
  workName: '',
  structureId: '',
  destinationCity: '',
  driverName: '',
  vehiclePlate: '',
  exitDate: '',
  exitTime: '',
  totalWeight: '',
  volume: '',
  returnDate: '',
  returnTime: '',
  observations: ''
});

function AppContent() {
  const { user, loading } = useAuth();
  const {
    formData, setFormData, selectedAssets, setSelectedAssets,
    errors, setErrors, formKey, handleInputChange,
    addAssetRow, removeAssetRow, updateAssetRow,
    validateForm, resetForm
  } = useTripForm();

  const { history, saveToHistory, deleteHistoryItem } = useHistory();
  const { isSyncing, pullData, pushAssets, pushVehicles, deleteFromRemote } = useSync();

  const [showToast, setShowToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Dynamic Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Modals/Panels State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load Initial Assets/Vehicles with hybrid sync
  useEffect(() => {
    const initData = async () => {
      // 1. Load from LocalStorage (Immediate UI)
      const savedAssets = localStorage.getItem('transport_app_assets');
      const savedVehicles = localStorage.getItem('transport_app_vehicles');

      if (savedAssets) setAssets(JSON.parse(savedAssets));
      else setAssets(INITIAL_ASSETS);

      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
      else setVehicles(INITIAL_VEHICLES);

      // 2. Pull from Supabase (Source of Truth)
      try {
        const remoteData = await pullData();
        if (remoteData.assets.length > 0) setAssets(remoteData.assets);
        if (remoteData.vehicles.length > 0) setVehicles(remoteData.vehicles);
        triggerToast('Dados sincronizados com a nuvem.');
      } catch (err) {
        console.warn('Falha na sincronização inicial (offline?).');
      }
    };
    initData();
  }, [pullData]);

  // Handle data persistence (Local + Supabase)
  const updateAssets = useCallback(async (newAssets: Asset[]) => {
    setAssets(newAssets);
    localStorage.setItem('transport_app_assets', JSON.stringify(newAssets));
    try {
      await pushAssets(newAssets);
    } catch (err: any) {
      triggerToast(`Aviso: Salvo apenas localmente (Erro: ${err.message || 'Cloud Error'}).`);
    }
  }, [pushAssets]);

  const updateVehicles = useCallback(async (newVehicles: Vehicle[]) => {
    setVehicles(newVehicles);
    localStorage.setItem('transport_app_vehicles', JSON.stringify(newVehicles));
    try {
      await pushVehicles(newVehicles);
    } catch (err: any) {
      triggerToast(`Aviso: Salvo apenas localmente (Erro: ${err.message || 'Cloud Error'}).`);
    }
  }, [pushVehicles]);

  const deleteAsset = useCallback(async (id: string) => {
    const updated = assets.filter(a => `${a.fiscalCode}|${a.patrimony}` !== id);
    setAssets(updated);
    localStorage.setItem('transport_app_assets', JSON.stringify(updated));
    try {
      await deleteFromRemote('assets', id);
      triggerToast('Item excluído da nuvem.');
    } catch (err) {
      triggerToast('Erro ao excluir da nuvem.');
    }
  }, [assets, deleteFromRemote]);

  const deleteVehicle = useCallback(async (plate: string) => {
    const updated = vehicles.filter(v => v.plate !== plate);
    setVehicles(updated);
    localStorage.setItem('transport_app_vehicles', JSON.stringify(updated));
    try {
      await deleteFromRemote('vehicles', plate);
      triggerToast('Veículo excluído da nuvem.');
    } catch (err) {
      triggerToast('Erro ao excluir da nuvem.');
    }
  }, [vehicles, deleteFromRemote]);

  const triggerToast = (message: string) => {
    setShowToast({ show: true, message });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setFormData(item.formData);
    // Migrate old 'assetCode' to 'assetFiscalCode' if necessary
    const migratedAssets = item.selectedAssets.map((a: any) => ({
      ...a,
      id: crypto.randomUUID(),
      assetFiscalCode: a.assetFiscalCode || a.assetCode || ''
    }));
    setSelectedAssets(migratedAssets);
    setIsPreviewMode(false);
  };

  const handleSaveToHistory = (isDraft: boolean = false) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      formData: { ...formData },
      selectedAssets: [...selectedAssets],
      isDraft
    };
    saveToHistory(newItem);
    triggerToast(isDraft ? 'Rascunho salvo!' : 'Salvo no histórico!');
  };

  const handlePreviewMode = () => {
    if (validateForm()) {
      setIsPreviewMode(true);
      window.scrollTo(0, 0);
    } else {
      triggerToast('Preencha os campos obrigatórios.');
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Limpar todo o formulário?')) {
      resetForm();
      setIsPreviewMode(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const generateMessageText = () => {
    const vehicle = vehicles.find(v => v.plate === formData.vehiclePlate);
    const vehicleDisplay = formData.vehiclePlate === 'OUTRO'
      ? formData.customVehiclePlate
      : `${formData.vehiclePlate}${vehicle ? ` (${vehicle.model})` : ''}`;
    const assetListString = selectedAssets
      .filter(item => item.assetFiscalCode)
      .map(item => {
        // item.assetFiscalCode now contains "code|patrimony"
        const [code, patrimony] = item.assetFiscalCode.includes('|')
          ? item.assetFiscalCode.split('|')
          : [item.assetFiscalCode, '-'];

        const asset = assets.find(a => a.fiscalCode === code && a.patrimony === patrimony);
        return `${item.quantity} - ${code} - ${asset?.description || 'Item desconhecido'}`;
      })
      .join('\n');

    let message = `Favor solicitar NF para a obra: ${formData.workName || '[Obra]'}, segue informações:\n`;
    message += `Estrutura: ${formData.structureId}\n`;
    message += `Data: ${formatDate(formData.exitDate)}\n`;
    message += `Horário: ${formData.exitTime}\n`;
    message += `Cidade destino: ${formData.destinationCity}\n`;
    message += `Motorista: ${formData.driverName}\n`;
    message += `Veículo: ${vehicleDisplay}\n`;
    message += `Peso: ${formData.totalWeight !== '' ? `${formData.totalWeight}kg` : '-'}\n`;
    message += `Volume: ${formData.volume !== '' ? `${formData.volume} vol` : '-'}\n`;
    if (formData.hasOtherMaterials) message += `Se Haverá Materiais: ${formData.hasOtherMaterials}\n`;
    message += `\nImobilizado:\n${assetListString || '(Nenhum item selecionado)'}\n`;
    message += `\nPREVISÃO DE RETORNO\n`;
    message += `Data: ${formatDate(formData.returnDate)}\n`;
    message += `Horário: ${formData.returnTime}`;

    if (formData.observations.trim()) {
      message += `\n\nObservações: ${formData.observations}`;
    }

    return message;
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generateMessageText());
    triggerToast('Mensagem copiada!');
    handleSaveToHistory(false);
  };

  const handleSendWhatsApp = () => {
    const text = generateMessageText();
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/554991109940?text=${encodedText}`, '_blank');
    handleSaveToHistory(false);
  };

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div key={formKey} className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Modals & Overlays */}
      {isHistoryOpen && (
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onLoad={loadHistoryItem}
          onDelete={deleteHistoryItem}
        />
      )}

      {isAdminOpen && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          assets={assets}
          vehicles={vehicles}
          onAssetsChange={updateAssets}
          onVehiclesChange={updateVehicles}
          onDeleteAsset={deleteAsset}
          onDeleteVehicle={deleteVehicle}
          isAuthenticated={isAdminAuthenticated}
          onLogin={() => setIsAdminAuthenticated(true)}
        />
      )}

      {/* Toast Notification */}
      {showToast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle className={`h-5 w-5 ${isSyncing ? 'text-blue-400 animate-pulse' : 'text-green-400'}`} />
          <span className="font-medium">
            {isSyncing ? 'Sincronizando...' : showToast.message}
          </span>
        </div>
      )}

      {/* Conditional Rendering: Form vs Preview */}
      {!isPreviewMode ? (
        <TripForm
          formData={formData}
          setFormData={setFormData}
          vehicles={vehicles}
          assets={assets}
          selectedAssets={selectedAssets}
          setSelectedAssets={setSelectedAssets}
          errors={errors}
          setErrors={setErrors}
          handleInputChange={handleInputChange}
          addAssetRow={addAssetRow}
          updateAsset={updateAssetRow}
          removeAsset={removeAssetRow}
          setIsHistoryOpen={setIsHistoryOpen}
          setIsAdminOpen={setIsAdminOpen}
          handlePreviewMode={handlePreviewMode}
        />
      ) : (
        <MessagePreview
          formData={formData}
          selectedAssets={selectedAssets}
          assets={assets}
          vehicles={vehicles}
          onBack={() => setIsPreviewMode(false)}
          onCopy={handleCopyMessage}
          onSendWhatsApp={handleSendWhatsApp}
          onSaveToHistory={handleSaveToHistory}
        />
      )}

      <div className="max-w-4xl mx-auto mt-8 flex flex-col items-center gap-4">
        <button
          onClick={handleResetForm}
          className="text-slate-500 hover:text-red-600 text-sm font-medium transition-colors flex items-center gap-1"
        >
          <RotateCcw size={14} />
          Limpar todos os campos
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
    </AuthProvider>
  );
}
