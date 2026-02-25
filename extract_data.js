import fs from 'fs';

const content = fs.readFileSync('constants.ts', 'utf8');

const assetMatches = content.matchAll(/{ fiscalCode: "(.*?)", patrimony: "(.*?)", description: "(.*?)" }/g);
const assets = Array.from(assetMatches).map(m => ({
    fiscalCode: m[1],
    patrimony: m[2],
    description: m[3]
}));

const vehicleMatches = content.matchAll(/{ plate: "(.*?)", model: "(.*?)", unit: "(.*?)", sector: "(.*?)" }/g);
const vehicles = Array.from(vehicleMatches).map(m => ({
    plate: m[1],
    model: m[2],
    unit: m[3],
    sector: m[4]
}));

fs.writeFileSync('temp_assets.json', JSON.stringify(assets, null, 2));
fs.writeFileSync('temp_vehicles.json', JSON.stringify(vehicles, null, 2));

console.log(`Extracted ${assets.length} assets and ${vehicles.length} vehicles.`);
