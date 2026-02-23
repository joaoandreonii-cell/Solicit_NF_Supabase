import React from 'react';
import {
    ArrowLeft, Copy, Send, CheckCircle2, Save, Trash2
} from 'lucide-react';
import { TripFormData, SelectedAsset } from '../types';

interface MessagePreviewProps {
    formData: TripFormData;
    selectedAssets: SelectedAsset[];
    assets: any[];
    vehicles: any[];
    onBack: () => void;
    onCopy: () => void;
    onSendWhatsApp: () => void;
    onSaveToHistory: (isDraft?: boolean) => void;
}

export const MessagePreview: React.FC<MessagePreviewProps> = ({
    formData,
    selectedAssets,
    assets,
    vehicles,
    onBack,
    onCopy,
    onSendWhatsApp,
    onSaveToHistory
}) => {
    const getAssetDescription = (fiscalCode: string) => {
        const asset = assets.find(a => a.fiscalCode === fiscalCode);
        if (!asset) return fiscalCode;
        return `${asset.description}${asset.patrimony && asset.patrimony !== '-' ? ` [Patrimônio: ${asset.patrimony}]` : ''}`;
    };

    const getVehicleDetails = () => {
        const vehicle = vehicles.find(v => v.plate === formData.vehiclePlate);
        if (!vehicle) return '';
        return `(${vehicle.model}${vehicle.unit !== '-' ? ` | ${vehicle.unit}` : ''}${vehicle.sector !== '-' ? ` | ${vehicle.sector}` : ''})`;
    };

    const generateMessage = () => {
        let message = `*SOLICITAÇÃO DE NF PARA TRANSPORTE*\n\n`;
        message += `*OBRA:* ${formData.workName}\n`;
        message += `*ESTRUTURA:* ${formData.structureId}\n`;
        message += `*DESTINO:* ${formData.destinationCity}\n`;
        message += `*MOTORISTA:* ${formData.driverName}\n`;
        const vehicleDisplay = formData.vehiclePlate === 'OUTRO'
            ? formData.customVehiclePlate
            : `${formData.vehiclePlate}${getVehicleDetails() ? ` - ${getVehicleDetails()}` : ''}`;

        message += `*PLACA:* ${vehicleDisplay}\n`;
        message += `*DATA/HORA SAÍDA:* ${formData.exitDate.split('-').reverse().join('/')} às ${formData.exitTime}\n\n`;

        message += `*ITENS DO ATIVO:*\n`;
        selectedAssets.forEach((item, index) => {
            message += `${index + 1}. [${item.assetFiscalCode}] ${getAssetDescription(item.assetFiscalCode)} - Qtd: ${item.quantity}\n`;
        });

        message += `\n*CARGA:* ${formData.totalWeight}kg | ${formData.volume} vol\n`;

        if (formData.returnDate) {
            message += `*PREVISÃO RETORNO:* ${formData.returnDate.split('-').reverse().join('/')} às ${formData.returnTime}\n`;
        }

        if (formData.observations) {
            message += `\n*OBSERVAÇÕES:* ${formData.observations}`;
        }

        return message;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-800 px-6 py-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold">Pré-visualização</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSaveToHistory(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/10"
                        >
                            <Save size={16} /> Salvar Rascunho
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-slate-50">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
                        <pre className="whitespace-pre-wrap font-sans text-slate-800 text-sm md:text-base leading-relaxed">
                            {generateMessage()}
                        </pre>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onCopy}
                        className="flex-1 flex justify-center items-center px-6 py-4 border border-slate-200 text-base font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                    >
                        <Copy className="h-5 w-5 mr-2" />
                        Copiar Texto
                    </button>
                    <button
                        onClick={onSendWhatsApp}
                        className="flex-1 flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg"
                    >
                        <Send className="h-5 w-5 mr-2" />
                        Enviar WhatsApp
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-blue-900 font-bold">Tudo pronto!</h3>
                    <p className="text-blue-700 text-sm mt-1">
                        Escolha uma das opções acima para compartilhar a solicitação.
                        Não esqueça de confirmar o envio no WhatsApp.
                    </p>
                </div>
            </div>
        </div>
    );
};
