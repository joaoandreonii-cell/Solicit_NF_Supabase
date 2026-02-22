import React from 'react';
import {
    Building2, Hash, MapPin, Truck, User, Calendar, Clock,
    Package, Scale, ClipboardList, PlusCircle, History, Settings
} from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { AssetRow } from './AssetRow';
import { Asset, Vehicle, SelectedAsset, TripFormData } from '../types';

interface TripFormProps {
    formData: TripFormData;
    setFormData: React.Dispatch<React.SetStateAction<TripFormData>>;
    vehicles: Vehicle[];
    assets: Asset[];
    selectedAssets: SelectedAsset[];
    setSelectedAssets: React.Dispatch<React.SetStateAction<SelectedAsset[]>>;
    errors: Partial<Record<keyof TripFormData, string>>;
    setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof TripFormData, string>>>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    addAssetRow: () => void;
    updateAsset: (id: string, field: keyof SelectedAsset, value: string | number) => void;
    removeAsset: (id: string) => void;
    setIsHistoryOpen: (open: boolean) => void;
    setIsAdminOpen: (open: boolean) => void;
    handlePreviewMode: () => void;
}

export const TripForm: React.FC<TripFormProps> = ({
    formData,
    setFormData,
    vehicles,
    assets,
    selectedAssets,
    setSelectedAssets,
    errors,
    setErrors,
    handleInputChange,
    addAssetRow,
    updateAsset,
    removeAsset,
    setIsHistoryOpen,
    setIsAdminOpen,
    handlePreviewMode
}) => {
    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white relative">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">Solicitação de NF</h1>
                        <p className="text-blue-100 mt-1 opacity-90">Preencha os dados da viagem abaixo</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            title="Ver Histórico"
                        >
                            <History size={20} />
                        </button>
                        <button
                            onClick={() => setIsAdminOpen(true)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            title="Administração"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {/* Section 1: Basic Info */}
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        Dados da Obra
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="workName" className="block text-sm font-medium text-slate-700">Nome da Obra</label>
                            <input
                                type="text"
                                id="workName"
                                name="workName"
                                value={formData.workName}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full bg-white text-slate-900 rounded-md shadow-sm focus:ring-blue-500 border p-2 ${errors.workName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                placeholder="Ex: Subestação Centro"
                                aria-invalid={!!errors.workName}
                                aria-describedby={errors.workName ? "workName-error" : undefined}
                            />
                            {errors.workName && <p className="mt-1 text-xs text-red-500" id="workName-error">{errors.workName}</p>}
                        </div>

                        <div>
                            <label htmlFor="structureId" className="block text-sm font-medium text-slate-700">Estrutura (Código)</label>
                            <input
                                type="text"
                                id="structureId"
                                inputMode="numeric"
                                name="structureId"
                                value={formData.structureId}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full bg-white text-slate-900 rounded-md shadow-sm focus:ring-blue-500 border p-2 ${errors.structureId ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                placeholder="Ex: 12345"
                                aria-invalid={!!errors.structureId}
                                aria-describedby={errors.structureId ? "structureId-error" : undefined}
                            />
                            {errors.structureId && <p className="mt-1 text-xs text-red-500" id="structureId-error">{errors.structureId}</p>}
                        </div>

                        <div>
                            <label htmlFor="destinationCity" className="block text-sm font-medium text-slate-700">Cidade Destino</label>
                            <input
                                type="text"
                                id="destinationCity"
                                name="destinationCity"
                                value={formData.destinationCity}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full bg-white text-slate-900 rounded-md shadow-sm focus:ring-blue-500 border p-2 ${errors.destinationCity ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                placeholder="Ex: São Paulo"
                                aria-invalid={!!errors.destinationCity}
                                aria-describedby={errors.destinationCity ? "destinationCity-error" : undefined}
                            />
                            {errors.destinationCity && <p className="mt-1 text-xs text-red-500" id="destinationCity-error">{errors.destinationCity}</p>}
                        </div>

                        <div>
                            <label htmlFor="vehiclePlate" className="block text-sm font-medium text-slate-700">Selecione o Veículo</label>
                            <SearchableSelect
                                id="vehiclePlate"
                                options={vehicles.map(v => ({ value: v.plate, label: v.plate, subLabel: v.model }))}
                                value={formData.vehiclePlate}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, vehiclePlate: val }));
                                    if (errors.vehiclePlate) setErrors(prev => ({ ...prev, vehiclePlate: undefined }));
                                }}
                                placeholder="Busque pela placa ou modelo"
                                className="mt-1"
                                error={!!errors.vehiclePlate}
                                allowCustomValue={true}
                            />
                            {errors.vehiclePlate && <p className="mt-1 text-xs text-red-500">{errors.vehiclePlate}</p>}
                            {formData.vehiclePlate && (
                                <div className="text-xs text-blue-600 mt-1 font-medium space-y-0.5">
                                    {vehicles.find(v => v.plate === formData.vehiclePlate) ? (
                                        <>
                                            <p>Modelo: {vehicles.find(v => v.plate === formData.vehiclePlate)?.model}</p>
                                            <p>Unidade: {vehicles.find(v => v.plate === formData.vehiclePlate)?.unit} | Setor: {vehicles.find(v => v.plate === formData.vehiclePlate)?.sector}</p>
                                        </>
                                    ) : (
                                        <p className="text-orange-600 font-semibold italic">Veículo não cadastrado. Preencha os detalhes abaixo:</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {!vehicles.find(v => v.plate === formData.vehiclePlate) && formData.vehiclePlate && (
                            <>
                                <div>
                                    <label htmlFor="customVehicleModel" className="block text-sm font-medium text-slate-700">Modelo do Veículo</label>
                                    <input
                                        type="text"
                                        id="customVehicleModel"
                                        name="customVehicleModel"
                                        value={formData.customVehicleModel || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        placeholder="Ex: Ford Cargo"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label htmlFor="customVehicleUnit" className="block text-sm font-medium text-slate-700">Unidade</label>
                                        <input
                                            type="text"
                                            id="customVehicleUnit"
                                            name="customVehicleUnit"
                                            value={formData.customVehicleUnit || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                            placeholder="Ex: Matriz"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="customVehicleSector" className="block text-sm font-medium text-slate-700">Setor</label>
                                        <input
                                            type="text"
                                            id="customVehicleSector"
                                            name="customVehicleSector"
                                            value={formData.customVehicleSector || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                            placeholder="Ex: Logística"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="driverName" className="block text-sm font-medium text-slate-700">Motorista</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="driverName"
                                    name="driverName"
                                    value={formData.driverName}
                                    onChange={handleInputChange}
                                    className={`block w-full bg-white text-slate-900 pl-10 rounded-md shadow-sm focus:ring-blue-500 border p-2 ${errors.driverName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                    placeholder="Nome completo"
                                    aria-invalid={!!errors.driverName}
                                    aria-describedby={errors.driverName ? "driverName-error" : undefined}
                                />
                            </div>
                            {errors.driverName && <p className="mt-1 text-xs text-red-500" id="driverName-error">{errors.driverName}</p>}
                        </div>

                        <div>
                            <label htmlFor="exitDate" className="block text-sm font-medium text-slate-700">Data de Saída</label>
                            <input
                                type="date"
                                id="exitDate"
                                name="exitDate"
                                value={formData.exitDate}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full bg-white text-slate-900 rounded-md shadow-sm focus:ring-blue-500 border p-2 ${errors.exitDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                aria-invalid={!!errors.exitDate}
                                aria-describedby={errors.exitDate ? "exitDate-error" : undefined}
                            />
                            {errors.exitDate && <p className="mt-1 text-xs text-red-500" id="exitDate-error">{errors.exitDate}</p>}
                        </div>

                        <div>
                            <label htmlFor="exitTime" className="block text-sm font-medium text-slate-700">Horário de Saída</label>
                            <input
                                type="time"
                                id="exitTime"
                                name="exitTime"
                                value={formData.exitTime}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full bg-white text-slate-900 rounded-md shadow-sm focus:ring-blue-500 border p-2 ${errors.exitTime ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                                aria-invalid={!!errors.exitTime}
                                aria-describedby={errors.exitTime ? "exitTime-error" : undefined}
                            />
                            {errors.exitTime && <p className="mt-1 text-xs text-red-500" id="exitTime-error">{errors.exitTime}</p>}
                        </div>
                    </div>
                </div>

                {/* Section 2: Assets */}
                <div className="p-6 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            Itens do Ativo
                        </h2>
                        <button
                            onClick={addAssetRow}
                            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                        >
                            <PlusCircle size={16} /> Adicionar Item
                        </button>
                    </div>

                    <div className="space-y-1">
                        {selectedAssets.map((item) => (
                            <AssetRow
                                key={item.id}
                                item={item}
                                assets={assets}
                                onUpdate={updateAsset}
                                onRemove={removeAsset}
                            />
                        ))}
                        {selectedAssets.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">Nenhum item adicionado ainda.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 3: Weight/Volume */}
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <Scale className="h-5 w-5 text-blue-500" />
                        Carga
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="totalWeight" className="block text-sm font-medium text-slate-700">Peso Total (kg)</label>
                            <input
                                type="number"
                                id="totalWeight"
                                name="totalWeight"
                                value={formData.totalWeight}
                                onChange={handleInputChange}
                                className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label htmlFor="volume" className="block text-sm font-medium text-slate-700">Volume (qtd)</label>
                            <input
                                type="number"
                                id="volume"
                                name="volume"
                                value={formData.volume}
                                onChange={handleInputChange}
                                className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                placeholder="0"
                            />
                        </div>

                        <div className="flex flex-col justify-center">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Haverá outros materiais?</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="hasOtherMaterials"
                                        value="Sim"
                                        checked={formData.hasOtherMaterials === 'Sim'}
                                        onChange={() => setFormData(prev => ({ ...prev, hasOtherMaterials: 'Sim' }))}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="text-sm text-slate-700">Sim</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="hasOtherMaterials"
                                        value="Não"
                                        checked={formData.hasOtherMaterials === 'Não'}
                                        onChange={() => setFormData(prev => ({ ...prev, hasOtherMaterials: 'Não' }))}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="text-sm text-slate-700">Não</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Return Forecast */}
                <div className="p-6 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        Previsão de Retorno
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                        <div>
                            <label htmlFor="returnDate" className="block text-sm font-medium text-slate-700">Data de Retorno</label>
                            <input
                                type="date"
                                id="returnDate"
                                name="returnDate"
                                value={formData.returnDate}
                                onChange={handleInputChange}
                                className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="returnTime" className="block text-sm font-medium text-slate-700">Horário de Retorno</label>
                            <input
                                type="time"
                                id="returnTime"
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
                    <label htmlFor="observations" className="block text-sm font-medium text-slate-700 mb-2">Alguma observação adicional?</label>
                    <textarea
                        id="observations"
                        name="observations"
                        rows={3}
                        value={formData.observations}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-white text-slate-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        placeholder="..."
                    />
                </div>
            </div>

            {/* Form Action Button */}
            <div className="px-6 py-6 bg-slate-50 border-t border-slate-200">
                <button
                    onClick={handlePreviewMode}
                    className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition-transform active:scale-[0.99]"
                >
                    <Eye className="h-5 w-5 mr-2" />
                    Visualizar Mensagem
                </button>
            </div>
        </div>
    );
};

// Add missing Eye icon
const Eye = ({ className, size = 20 }: { className?: string; size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
