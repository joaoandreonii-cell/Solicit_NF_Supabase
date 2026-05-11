// Resolved at build time via VITE_SECTOR env var.
// Astec deploy: VITE_SECTOR=astec  → uses 'assets' / 'vehicles'
// CMI   deploy: VITE_SECTOR=cmi    → uses 'assets-cmi' / 'vehicles-cmi'

const sector = (import.meta.env.VITE_SECTOR as string) || 'cmi';

export const ASSETS_TABLE   = sector === 'astec' ? 'assets'       : 'assets-cmi';
export const VEHICLES_TABLE = sector === 'astec' ? 'vehicles'     : 'vehicles-cmi';

export const RPC_GET_ASSETS    = sector === 'astec' ? 'get_all_assets'    : 'get_all_assets_cmi';
export const RPC_GET_VEHICLES  = sector === 'astec' ? 'get_all_vehicles'  : 'get_all_vehicles_cmi';
export const RPC_PUSH_ASSETS   = sector === 'astec' ? 'upsert_assets'     : 'upsert_assets_cmi';
export const RPC_PUSH_VEHICLES = sector === 'astec' ? 'upsert_vehicles'   : 'upsert_vehicles_cmi';
