import React from 'react';
import { HistoryItem } from '../types';
import { Trash2, RotateCcw, X, Calendar, MapPin, FileText, Building2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoad,
  onDelete
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Histórico de Solicitações</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-slate-50">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>Nenhum histórico encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center text-sm text-slate-500 gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    {item.isDraft && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <FileText size={10} className="mr-1" />
                        Rascunho
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Building2 size={16} className="text-blue-500" />
                      {item.formData.workName || 'Obra não informada'}
                    </h3>
                    <div className="text-sm text-slate-600 mt-1 ml-6">
                      <p className="flex items-center gap-1.5 mb-1 text-slate-500 italic">
                        <MapPin size={12} />
                        {item.formData.destinationCity || 'Destino não informado'}
                      </p>
                      <p>Motorista: {item.formData.driverName || '-'}</p>
                      <p>Veículo: {item.formData.vehiclePlate || '-'}</p>
                      <p>Itens: {item.selectedAssets.length}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="flex items-center text-sm text-red-600 hover:text-red-800 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} className="mr-1.5" />
                      Excluir
                    </button>
                    <button
                      onClick={() => {
                        onLoad(item);
                        onClose();
                      }}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors font-medium"
                    >
                      <RotateCcw size={16} className="mr-1.5" />
                      {item.isDraft ? 'Retomar' : 'Reutilizar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};