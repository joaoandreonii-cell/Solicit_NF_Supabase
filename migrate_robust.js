const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'APPs', 'solit_NF', 'Solicit_NF_Supabase', 'constants.ts');

console.log(`Starting migration for: ${filePath}`);

try {
    const originalContent = fs.readFileSync(filePath, 'utf8');

    // This regex looks for { code: "...", description: "..." }
    // It captures the values and replaces them with the new schema.
    // It's designed to be idempotent-ish by only matching 'code:' (not 'fiscalCode:')
    const regex = /\{\s*code:\s*"([^"]+)",\s*description:\s*"([^"]+)"\s*\}/g;

    let matchCount = 0;
    const transformedContent = originalContent.replace(regex, (match, code, description) => {
        matchCount++;
        return `{ fiscalCode: "${code}", patrimony: "-", description: "${description}" }`;
    });

    if (matchCount === 0) {
        console.log("No items found using the old schema (code: ...). Already migrated?");
    } else {
        fs.writeFileSync(filePath, transformedContent, 'utf8');
        console.log(`Successfully migrated ${matchCount} items!`);
    }
} catch (error) {
    console.error("MIGRATION FAILED:");
    console.error(error.message);
    process.exit(1);
}
