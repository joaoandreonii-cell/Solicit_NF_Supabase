import fs from 'fs';

const assets = JSON.parse(fs.readFileSync('temp_assets.json', 'utf8'));
const vehicles = JSON.parse(fs.readFileSync('temp_vehicles.json', 'utf8'));

let sql = '';

// Assets migration
if (assets.length > 0) {
    sql += 'INSERT INTO assets (fiscal_code, patrimony, description, updated_at)\nVALUES\n';
    sql += assets.map(a => `('${a.fiscalCode.replace(/'/g, "''")}', '${a.patrimony.replace(/'/g, "''")}', '${a.description.replace(/'/g, "''")}', NOW())`).join(',\n');
    sql += '\nON CONFLICT (fiscal_code, patrimony) DO NOTHING;\n\n';
}

// Vehicles migration
if (vehicles.length > 0) {
    sql += 'INSERT INTO vehicles (plate, model, unit, sector, updated_at)\nVALUES\n';
    sql += vehicles.map(v => `('${v.plate.replace(/'/g, "''")}', '${v.model.replace(/'/g, "''")}', '${v.unit.replace(/'/g, "''")}', '${v.sector.replace(/'/g, "''")}', NOW())`).join(',\n');
    sql += '\nON CONFLICT (plate) DO NOTHING;\n';
}

fs.writeFileSync('migration.sql', sql);
console.log('Migration SQL generated in migration.sql');
