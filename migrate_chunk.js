const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'APPs', 'solit_NF', 'Solicit_NF_Supabase', 'constants.ts');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to find: { code: "...", description: "..." }
    // We only want to transform ones that haven't been transformed yet.
    // The components now expect fiscalCode, patrimony, description.

    const regex = /\{\s*code:\s*"([^"]*)",\s*description:\s*"([^"]*)"\s*\}/g;

    const newContent = content.replace(regex, (match, code, description) => {
        return `{ fiscalCode: "${code}", patrimony: "-", description: "${description}" }`;
    });

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Migration successful!");
} catch (err) {
    console.error("Error during migration:", err);
}
