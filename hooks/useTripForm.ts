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
    totalWeight: 0,
    volume: 0,
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        if (!formData.structureId.trim()) newErrors.structureId = 'Código da estrutura é obrigatório';
        if (!formData.destinationCity.trim()) newErrors.destinationCity = 'Cidade destino é obrigatória';
        if (!formData.driverName.trim()) newErrors.driverName = 'Nome do motorista é obrigatório';
        if (!formData.vehiclePlate.trim()) newErrors.vehiclePlate = 'Selecione um veículo';
        if (formData.vehiclePlate === 'OUTRO' && !formData.customVehiclePlate?.trim()) {
            newErrors.customVehiclePlate = 'Placa é obrigatória para outro veículo';
        }
        if (!formData.exitDate) newErrors.exitDate = 'Data de saída é obrigatória';
        if (!formData.exitTime) newErrors.exitTime = 'Horário de saída é obrigatório';

        if (formData.totalWeight < 0) newErrors.totalWeight = 'Peso não pode ser negativo';
        if (formData.volume < 0) newErrors.volume = 'Volume não pode ser negativo';

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
