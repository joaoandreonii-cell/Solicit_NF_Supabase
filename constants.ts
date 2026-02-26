import { Asset, Vehicle } from './types';

export const ASSETS: Asset[] = [
    { fiscalCode: 'IMO-40TDM', patrimony: '-', description: 'APARELHO DIGITAL OPENSTAGE 40 TDM' },
    { fiscalCode: 'IMOOPENSTAGE15T', patrimony: '-', description: 'APARELHO OPENSTAGE 15 TDM' },
    { fiscalCode: 'IMOB-GWH18QD', patrimony: '-', description: 'AR CONDICIONADO 18.000 BTUS 220V INVERTER QUENTE/FRIO GREE' }
];

export const VEHICLES: Vehicle[] = [
    { plate: 'ABC-1234', model: 'VW Saveiro', unit: 'Obras', sector: 'Logística' },
    { plate: 'XYZ-5678', model: 'Fiat Strada', unit: 'Manutenção', sector: 'Campo' }
];
