const fs = require('fs');

// Using the absolute path as requested by the environment
const filePath = 'c:\\APPs\\solit_NF\\Solicit_NF_Supabase\\constants.ts';

console.log(`Starting migration process for: ${filePath}`);

try {
    if (!fs.existsSync(filePath)) {
        console.error(`ERROR: File does not exist at ${filePath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`File read successfully. Length: ${content.length} characters.`);

    // Regex to transform { code: "...", description: "..." }
    // We only match lines that haven't been migrated yet (starting with 'code:')
    const regex = /\{\s*code:\s*"([^"]*)",\s*description:\s*"([^"]*)"\s*\}/g;

    let matchCount = 0;
    const transformed = content.replace(regex, (match, code, description) => {
        matchCount++;
        return `{ fiscalCode: "${code}", patrimony: "-", description: "${description}" }`;
    });

    if (matchCount === 0) {
        console.log("No candidates for migration found. The file may already be updated.");
    } else {
        fs.writeFileSync(filePath, transformed, 'utf8');
        console.log(`Successfully migrated ${matchCount} items.`);
    }

} catch (err) {
    console.error("CRITICAL ERROR during script execution:");
    console.error(err);
    process.exit(1);
}
