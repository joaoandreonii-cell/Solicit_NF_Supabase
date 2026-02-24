import React, { useState } from 'react';
import { TripFormData, SelectedAsset } from '../types';

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
    observations: '',
    customVehiclePlate: ''
});

export const useTripForm = () => {
    const [formData, setFormData] = useState<TripFormData>(getInitialForm());
    const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof TripFormData, string>>>({});
    const [formKey, setFormKey] = useState(0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let finalValue: string | number = value;

        if (type === 'number') {
            finalValue = value === '' ? '' : parseFloat(value);
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const addAssetRow = () => {
        const newAsset: SelectedAsset = {
            id: crypto.randomUUID(),
            assetFiscalCode: '',
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

        // Structure ID: exactly 6 digits
        if (!formData.structureId.trim()) {
            newErrors.structureId = 'Código da estrutura é obrigatório';
        } else if (!/^\d{6}$/.test(formData.structureId)) {
            newErrors.structureId = 'A estrutura deve ter exatamente 6 dígitos';
        }

        if (!formData.destinationCity.trim()) newErrors.destinationCity = 'Cidade destino é obrigatória';
        if (!formData.driverName.trim()) newErrors.driverName = 'Nome do motorista é obrigatório';

        // Vehicle Plate Validation (Old Brazilian format or Mercosul)
        const plateRegex = /^[A-Z]{3}[- ]?\d[A-Z0-9]\d{2}$/i;
        if (!formData.vehiclePlate.trim()) {
            newErrors.vehiclePlate = 'Selecione um veículo';
        } else if (formData.vehiclePlate === 'OUTRO') {
            if (!formData.customVehiclePlate?.trim()) {
                newErrors.customVehiclePlate = 'Placa é obrigatória para outro veículo';
            } else if (!plateRegex.test(formData.customVehiclePlate)) {
                newErrors.customVehiclePlate = 'A placa deve ser um padrão válido (ex: ABC-1234 ou ABC1C34)';
            }
        }

        if (!formData.exitDate) {
            newErrors.exitDate = 'Data de saída é obrigatória';
        }
        if (!formData.exitTime) {
            newErrors.exitTime = 'Horário de saída é obrigatório';
        }

        // Return Forecast (Mandatory)
        if (!formData.returnDate) {
            newErrors.returnDate = 'Data de retorno é obrigatória';
        }
        if (!formData.returnTime) {
            newErrors.returnTime = 'Horário de retorno é obrigatório';
        }

        // Date and Time Validations
        if (formData.exitDate && formData.exitTime) {
            const now = new Date();
            const exitDateTime = new Date(`${formData.exitDate}T${formData.exitTime}`);

            if (exitDateTime < now) {
                newErrors.exitDate = 'A saída deve ser igual ou depois da data e horário atual';
            }

            if (formData.returnDate && formData.returnTime) {
                const returnDateTime = new Date(`${formData.returnDate}T${formData.returnTime}`);
                if (returnDateTime <= exitDateTime) {
                    newErrors.returnDate = 'O retorno deve ser posterior à data e hora da saída';
                }
            }
        }

        if (formData.totalWeight !== '' && formData.totalWeight < 0) newErrors.totalWeight = 'Peso não pode ser negativo';
        if (formData.volume !== '' && formData.volume < 0) newErrors.volume = 'Volume não pode ser negativo';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData(getInitialForm());
        setSelectedAssets([]);
        setErrors({});
        setFormKey(prev => prev + 1);
    };

    return {
        formData,
        setFormData,
        selectedAssets,
        setSelectedAssets,
        errors,
        setErrors,
        formKey,
        handleInputChange,
        addAssetRow,
        removeAssetRow,
        updateAssetRow,
        validateForm,
        resetForm
    };
};
