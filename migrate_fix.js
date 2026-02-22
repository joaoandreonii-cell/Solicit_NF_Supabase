const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'APPs', 'solit_NF', 'Solicit_NF_Supabase', 'constants.ts');

try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Pattern to find: { code: "...", description: "..." }
    const regex = /\{\s*code:\s*"([^"]*)",\s*description:\s*"([^"]*)"\s*\}/g;

    const newContent = content.replace(regex, (match, code, description) => {
        return `{ fiscalCode: "${code}", patrimony: "-", description: "${description}" }`;
    });

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Migration finished successfully!");
} catch (err) {
    console.error("Critical error during migration:", err);
    process.exit(1);
}
