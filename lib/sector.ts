// Resolved at build time from VITE_SECTOR env var (Vite injects this in the bundle).
// Astec deploy: VITE_SECTOR=astec  → uses 'assets' / 'vehicles'
// CMI   deploy: VITE_SECTOR=cmi    → uses 'assets-cmi' / 'vehicles-cmi'

const raw = (import.meta.env.VITE_SECTOR as string | undefined);
const sector = (raw ?? '').trim().toLowerCase();

if (sector !== 'astec' && sector !== 'cmi') {
    const got = raw === undefined ? '(undefined)' : JSON.stringify(raw);
    throw new Error(
        `VITE_SECTOR inválido: ${got}. Configure VITE_SECTOR=astec ou VITE_SECTOR=cmi ` +
        `no Vercel (Settings → Environment Variables) e faça um redeploy.`
    );
}

export const SECTOR: 'astec' | 'cmi' = sector;

export const ASSETS_TABLE   = sector === 'astec' ? 'assets'       : 'assets-cmi';
export const VEHICLES_TABLE = sector === 'astec' ? 'vehicles'     : 'vehicles-cmi';

export const RPC_GET_ASSETS    = sector === 'astec' ? 'get_all_assets'    : 'get_all_assets_cmi';
export const RPC_GET_VEHICLES  = sector === 'astec' ? 'get_all_vehicles'  : 'get_all_vehicles_cmi';
export const RPC_PUSH_ASSETS   = sector === 'astec' ? 'upsert_assets'     : 'upsert_assets_cmi';
export const RPC_PUSH_VEHICLES = sector === 'astec' ? 'upsert_vehicles'   : 'upsert_vehicles_cmi';

// Expose for runtime inspection via DevTools console: type `__SECTOR__`
if (typeof window !== 'undefined') {
    (window as any).__SECTOR__ = sector;
    (window as any).__ASSETS_TABLE__ = ASSETS_TABLE;
    (window as any).__VEHICLES_TABLE__ = VEHICLES_TABLE;
    console.info(
        `%c[App sector] ${sector.toUpperCase()}%c  tables: ${ASSETS_TABLE} / ${VEHICLES_TABLE}`,
        'background:#1e40af;color:white;padding:2px 6px;border-radius:3px;font-weight:bold',
        'color:#64748b'
    );
}
