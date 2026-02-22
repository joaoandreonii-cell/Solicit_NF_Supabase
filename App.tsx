import React, { useState, useEffect } from 'react';
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

const getInitialForm = (): TripFormData => ({
  workName: '',
  structureId: '',
  destinationCity: '',
  driverName: '',
  vehiclePlate: '',
  exitDate: '',
  exitTime: '',
  totalWeight: 0,
  volume: 0,
  returnDate: '',
  returnTime: '',
  observations: ''
});

function AppContent() {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState<TripFormData>(getInitialForm());
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const [showToast, setShowToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formKey, setFormKey] = useState(0); // Used to force re-render of form on reset

  // Dynamic Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Admin State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<Partial<Record<keyof TripFormData, string>>>({});

  // Load Initial Data (History, Assets, Vehicles)
  useEffect(() => {
    // History
    const savedHistory = localStorage.getItem('transport_app_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }

    // Assets
    const savedAssets = localStorage.getItem('transport_app_assets');
    if (savedAssets) {
      try { setAssets(JSON.parse(savedAssets)); } catch (e) { setAssets(INITIAL_ASSETS); }
    } else {
      setAssets(INITIAL_ASSETS);
    }

    // Vehicles
    const savedVehicles = localStorage.getItem('transport_app_vehicles');
    if (savedVehicles) {
      try { setVehicles(JSON.parse(savedVehicles)); } catch (e) { setVehicles(INITIAL_VEHICLES); }
    } else {
      setVehicles(INITIAL_VEHICLES);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => { localStorage.setItem('transport_app_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('transport_app_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('transport_app_vehicles', JSON.stringify(vehicles)); }, [vehicles]);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const triggerToast = (message: string) => {
    setShowToast({ show: true, message });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('transport_app_history', JSON.stringify(newHistory));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setFormData(item.formData);
    const freshAssets = item.selectedAssets.map(a => ({
      ...a,
      id: crypto.randomUUID()
    }));
    setSelectedAssets(freshAssets);
    setIsPreviewMode(false);
    setFormKey(prev => prev + 1);
  };

  const handleSaveToHistory = (isDraft: boolean = false) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      formData: { ...formData },
      selectedAssets: [...selectedAssets],
      isDraft
    };

    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem('transport_app_history', JSON.stringify(newHistory));

    triggerToast(isDraft ? 'Rascunho salvo no histórico!' : 'Salvo no histórico!');
  };

  const addAssetRow = () => {
    const newAsset: SelectedAsset = {
      id: crypto.randomUUID(),
      assetCode: '',
      quantity: 1
    };
    setSelectedAssets(prev => [...prev, newAsset]);
  };

  const removeAssetRow = (id: string) => {
    setSelectedAssets(prev => prev.filter(item => item.id !== id));
  };

  const updateAssetRow = (id: string, field: keyof SelectedAsset, value: string | number) => {
    setSelectedAssets(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof TripFormData, string>> = {};
    if (!formData.workName.trim()) newErrors.workName = 'Nome da obra é obrigatório';
    if (!formData.structureId.trim()) newErrors.structureId = 'Código da estrutura é obrigatório';
    if (!formData.destinationCity.trim()) newErrors.destinationCity = 'Cidade destino é obrigatória';
    if (!formData.driverName.trim()) newErrors.driverName = 'Nome do motorista é obrigatório';
    if (!formData.vehiclePlate.trim()) newErrors.vehiclePlate = 'Selecione um veículo';
    if (!formData.exitDate) newErrors.exitDate = 'Data de saída é obrigatória';
    if (!formData.exitTime) newErrors.exitTime = 'Horário de saída é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreviewMode = () => {
    if (validateForm()) {
      setIsPreviewMode(true);
      window.scrollTo(0, 0);
    } else {
      triggerToast('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o formulário? Todas as informações não salvas serão perdidas.')) {
      setFormData(getInitialForm());
      setSelectedAssets([]);
      setIsPreviewMode(false);
      setErrors({});
      setFormKey(prev => prev + 1);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const generateMessageText = () => {
    const vehicle = vehicles.find(v => v.plate === formData.vehiclePlate);
    const assetListString = selectedAssets
      .filter(item => item.assetCode)
      .map(item => {
        const asset = assets.find(a => a.code === item.assetCode);
        return `${item.quantity} - ${item.assetCode} - ${asset?.description || 'Item desconhecido'}`;
      })
      .join('\n');

    let message = `Favor solicitar NF para a obra: ${formData.workName || '[Obra]'}, segue informações:\n`;
    message += `Estrutura: ${formData.structureId}\n`;
    message += `Data: ${formatDate(formData.exitDate)}\n`;
    message += `Horário: ${formData.exitTime}\n`;
    message += `Cidade destino: ${formData.destinationCity}\n`;
    message += `Motorista: ${formData.driverName}\n`;
    message += `Veículo: ${formData.vehiclePlate} (${vehicle?.model || ''})\n`;
    message += `Peso: ${formData.totalWeight}kg\n`;
    message += `Volume: ${formData.volume} vol\n`;
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
          onAssetsChange={(newAssets) => setAssets(newAssets)}
          onVehiclesChange={(newVehicles) => setVehicles(newVehicles)}
          isAuthenticated={isAdminAuthenticated}
          onLogin={() => setIsAdminAuthenticated(true)}
        />
      )}

      {/* Toast Notification */}
      {showToast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="font-medium">{showToast.message}</span>
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
    </AuthProvider>
  );
}
