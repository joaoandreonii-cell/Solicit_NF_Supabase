import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/Auth/LoginScreen';
import { TripFormData, SelectedAsset, HistoryItem, Asset, Vehicle } from './types';
import { ASSETS as INITIAL_ASSETS, VEHICLES as INITIAL_VEHICLES } from './constants';
import { AssetRow } from './components/AssetRow';
import { HistoryModal } from './components/HistoryModal';
import { AdminPanel } from './components/AdminPanel';
import { SearchableSelect } from './components/SearchableSelect';
import {
  Truck,
  MapPin,
  Calendar,
  User,
  Package,
  Plus,
  MessageSquare,
  Copy,
  CheckCircle2,
  Box,
  History,
  Eye,
  Edit,
  FileText,
  Send,
  ClipboardList,
  Settings,
  Trash2,
  RotateCcw,
  Save
} from 'lucide-react';

const getInitialForm = (): TripFormData => ({
  structureId: '',
  workName: '',
  exitDate: '',
  exitTime: '',
  destinationCity: '',
  driverName: '',
  vehiclePlate: '',
  totalWeight: '',
  volume: '',
  hasOtherMaterials: 'Não',
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

  const handleRadioChange = (value: 'Sim' | 'Não') => {
    setFormData(prev => ({ ...prev, hasOtherMaterials: value }));
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

  const clearAssetList = () => {
    if (selectedAssets.length > 0 && confirm('Tem certeza que deseja limpar toda a lista de imobilizados?')) {
      setSelectedAssets([]);
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o formulário? Todas as informações não salvas serão perdidas.')) {
      setFormData(getInitialForm());
      setSelectedAssets([]);
      setIsPreviewMode(false);
      setFormKey(prev => prev + 1); // Force form components to re-mount
    }
  };

  // --- Date Formatting Helper ---
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // --- Message Generation ---
  const generateMessageText = () => {
    const vehicle = vehicles.find(v => v.plate === formData.vehiclePlate);

    // Build the assets list string
    const assetListString = selectedAssets
      .filter(item => item.assetCode) // Only include items with a selected asset
      .map(item => {
        const asset = assets.find(a => a.code === item.assetCode);
        const description = asset ? asset.description : 'Item desconhecido';
        return `${item.quantity} - ${item.assetCode} - ${description}`;
      })
      .join('\n');

    let message = `Favor solicitar NF para a obra: ${formData.workName || '[Obra]'}, segue informações:
Estrutura: ${formData.structureId}
Data: ${formatDate(formData.exitDate)}
Horário: ${formData.exitTime}
Cidade destino: ${formData.destinationCity}
Motorista: ${formData.driverName}
Veículo: ${formData.vehiclePlate} (${vehicle?.model || ''})
Peso: ${formData.totalWeight}
Volume: ${formData.volume}
Se Haverá Materiais: ${formData.hasOtherMaterials}

Imobilizado:
${assetListString || '(Nenhum item selecionado)'}

PREVISÃO DE RETORNO
Data: ${formatDate(formData.returnDate)}
Horário: ${formData.returnTime}`;

    if (formData.observations.trim()) {
      message += `\n\nObservações: ${formData.observations}`;
    }

    return message;
  };

  // --- History Logic ---

  const addToHistory = (isDraft = false) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      formData: { ...formData },
      selectedAssets: [...selectedAssets],
      isDraft: isDraft
    };

    setHistory(prev => [newItem, ...prev]);

    if (isDraft) {
      triggerToast('Rascunho salvo no histórico!');
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setFormData(item.formData);
    const freshAssets = item.selectedAssets.map(a => ({
      ...a,
      id: crypto.randomUUID()
    }));
    setSelectedAssets(freshAssets);
    setIsPreviewMode(false); // Ensure we go back to edit mode when loading
    setFormKey(prev => prev + 1); // Force re-mount to update SearchableSelects etc
  };

  const triggerToast = (message: string) => {
    setShowToast({ show: true, message });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const handleCopy = () => {
    const text = generateMessageText();
    navigator.clipboard.writeText(text);
    triggerToast('Texto copiado com sucesso!');
  };

  const handleWhatsApp = () => {
    // Save to history automatically when actually sending
    addToHistory();

    const text = generateMessageText();
    const encodedText = encodeURIComponent(text);
    // Specific number: +55 49 9110-9940
    window.open(`https://wa.me/554991109940?text=${encodedText}`, '_blank');
  };

  // --- Views ---

  const renderForm = () => (
    <div key={formKey} className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">

      {/* Section 1: Trip Data */}
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-blue-500" />
          Dados da Viagem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium text-slate-700">Nome da Obra</label>
            <input
              type="text"
              name="workName"
              value={formData.workName}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              placeholder="Ex: Subestação Centro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Estrutura (Código)</label>
            <input
              type="text"
              inputMode="numeric"
              name="structureId"
              value={formData.structureId}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              placeholder="Ex: 12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Cidade Destino</label>
            <input
              type="text"
              name="destinationCity"
              value={formData.destinationCity}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              placeholder="Ex: São Paulo"
            />
          </div>

          {/* Swapped Position: Vehicle first */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Selecione o Veículo</label>
            <SearchableSelect
              options={vehicles.map(v => ({ value: v.plate, label: v.plate, subLabel: v.model }))}
              value={formData.vehiclePlate}
              onChange={(val) => setFormData(prev => ({ ...prev, vehiclePlate: val }))}
              placeholder="Busque pela placa ou modelo"
              className="mt-1"
            />
            {formData.vehiclePlate && (
              <p className="text-xs text-blue-600 mt-1 font-medium">
                Modelo: {vehicles.find(v => v.plate === formData.vehiclePlate)?.model}
              </p>
            )}
          </div>

          {/* Swapped Position: Driver second */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Motorista</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleInputChange}
                className="block w-full bg-white text-slate-900 pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                placeholder="Nome completo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Data de Saída</label>
            <input
              type="date"
              name="exitDate"
              value={formData.exitDate}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Horário de Saída</label>
            <input
              type="time"
              name="exitTime"
              value={formData.exitTime}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>

        </div>
      </div>

      {/* Section 2: Cargo */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Box className="h-5 w-5 text-blue-500" />
          Carga
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div>
            <label className="block text-sm font-medium text-slate-700">Peso Total (kg)</label>
            <input
              type="number"
              name="totalWeight"
              value={formData.totalWeight}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Volume (qtd)</label>
            <input
              type="number"
              name="volume"
              value={formData.volume}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Haverá NF de outros materiais?</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600 focus:ring-blue-500"
                  name="hasOtherMaterials"
                  checked={formData.hasOtherMaterials === 'Sim'}
                  onChange={() => handleRadioChange('Sim')}
                />
                <span className="ml-2">Sim</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600 focus:ring-blue-500"
                  name="hasOtherMaterials"
                  checked={formData.hasOtherMaterials === 'Não'}
                  onChange={() => handleRadioChange('Não')}
                />
                <span className="ml-2">Não</span>
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* Section 3: Assets List */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Lista de Imobilizados
          </h2>
          <div className="flex gap-2 items-center">
            {selectedAssets.length > 0 && (
              <button
                type="button"
                onClick={clearAssetList}
                className="inline-flex items-center px-3 py-1.5 border border-red-200 text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={addAssetRow}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Item
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 min-h-[100px] border border-slate-200">
          {selectedAssets.length === 0 ? (
            <p className="text-slate-400 text-center py-4 italic">
              Nenhum imobilizado adicionado. Clique no botão acima para adicionar.
            </p>
          ) : (
            selectedAssets.map(item => (
              <AssetRow
                key={item.id}
                item={item}
                assets={assets}
                onUpdate={updateAssetRow}
                onRemove={removeAssetRow}
              />
            ))
          )}
        </div>
      </div>

      {/* Section 4: Return Forecast */}
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-500" />
          Previsão de Retorno
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700">Data de Retorno</label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Horário de Retorno</label>
            <input
              type="time"
              name="returnTime"
              value={formData.returnTime}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Observations */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-blue-500" />
          Observações
        </h2>
        <textarea
          name="observations"
          rows={3}
          value={formData.observations}
          onChange={handleInputChange}
          className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          placeholder="Alguma observação adicional?"
        />
      </div>

      {/* Form Action Button */}
      <div className="px-6 py-6 bg-slate-50 border-t border-slate-200">
        <button
          onClick={() => setIsPreviewMode(true)}
          className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition-transform active:scale-[0.99]"
        >
          <Eye className="h-5 w-5 mr-2" />
          Visualizar Mensagem
        </button>
      </div>

    </div>
  );

  const renderPreview = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Pré-visualização da Mensagem
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Confira os dados antes de enviar.
        </p>
      </div>

      <div className="p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 font-mono text-sm text-green-900 whitespace-pre-wrap shadow-inner">
          {generateMessageText()}
        </div>
      </div>

      <div className="px-6 py-6 bg-slate-50 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setIsPreviewMode(false)}
          className="flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Edit className="h-5 w-5 mr-2" />
          Editar
        </button>

        <button
          onClick={() => addToHistory(true)}
          className="flex justify-center items-center px-4 py-3 border border-blue-300 shadow-sm text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Save className="h-5 w-5 mr-2" />
          Salvar Rascunho
        </button>

        <button
          onClick={handleCopy}
          className="flex justify-center items-center px-4 py-3 border border-blue-200 shadow-sm text-base font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Copy className="h-5 w-5 mr-2" />
          Copiar
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transition-transform active:scale-[0.99]"
        >
          <Send className="h-5 w-5 mr-2" />
          Enviar WhatsApp
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Top Toolbar */}
        <div className="flex justify-between items-center mb-2 px-1">
          <button
            type="button"
            onClick={handleResetForm}
            className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
            title="Limpar todos os campos"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              title="Gerenciar Dados"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
              title="Ver Histórico"
            >
              <History className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
            <Truck className="h-8 w-8 text-blue-600" />
            Solicitação de NF
          </h1>
          <p className="mt-2 text-slate-600">Preencha os dados abaixo para gerar a solicitação.</p>
        </div>

        {/* View Toggle */}
        {isPreviewMode ? renderPreview() : renderForm()}

        {/* Toast Notification */}
        {showToast.show && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-xl flex items-center space-x-2 animate-bounce z-40">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">{showToast.message}</span>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-400">
          Uso Interno - Equipe Técnica
        </div>

      </div>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoad={loadHistoryItem}
        onDelete={deleteHistoryItem}
      />

      {isAdminOpen && (
        <AdminPanel
          assets={assets}
          setAssets={setAssets}
          vehicles={vehicles}
          setVehicles={setVehicles}
          onClose={() => setIsAdminOpen(false)}
          isAuthenticated={isAdminAuthenticated}
          onLogin={() => setIsAdminAuthenticated(true)}
        />
      )}
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
