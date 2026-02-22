const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'APPs', 'solit_NF', 'Solicit_NF_Supabase', 'constants.ts');

try {
    console.log(`Reading file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');

    // Pattern to find: { code: "...", description: "..." }
    // We replace it with: { fiscalCode: "...", patrimony: "-", description: "..." }
    const regex = /\{\s*code:\s*"([^"]*)",\s*description:\s*"([^"]*)"\s*\}/g;

    const newContent = content.replace(regex, (match, code, description) => {
        return `{ fiscalCode: "${code}", patrimony: "-", description: "${description}" }`;
    });

    if (content === newContent) {
        console.log("No matches found or already migrated.");
    } else {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log("Migration finished successfully!");
    }
} catch (err) {
    console.error("ERROR:");
    console.error(err.message);
    process.exit(1);
}
