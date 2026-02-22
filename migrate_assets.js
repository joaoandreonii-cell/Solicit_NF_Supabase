const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'APPs', 'solit_NF', 'Solicit_NF_Supabase', 'constants.ts');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Pattern to find: { code: "...", description: "..." }
    // Some lines might already be migrated, so we avoid them.
    // The previous replace_file_content call partially migrated some lines (fiscalCode),
    // but the script should be robust.

    const regex = /\{\s*code:\s*"([^"]*)",\s*description:\s*"([^"]*)"\s*\}/g;

    const newContent = content.replace(regex, (match, code, description) => {
        return `{ fiscalCode: "${code}", patrimony: "-", description: "${description}" }`;
    });

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Migration complete!");
} catch (err) {
    console.error("Error migrating file:", err);
    process.exit(1);
}
