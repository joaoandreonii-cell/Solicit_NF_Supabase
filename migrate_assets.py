import re
import os

file_path = r'c:\APPs\solit_NF\Solicit_NF_Supabase\constants.ts'

print(f"Opening file: {file_path}")

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to find: { code: "...", description: "..." }
    # We replace it with: { fiscalCode: "...", patrimony: "-", description: "..." }
    pattern = r'\{\s*code:\s*"([^"]*)",\s*description:\s*"([^"]*)"\s*\}'
    
    def replacer(match):
        code = match.group(1)
        description = match.group(2)
        return f'{{ fiscalCode: "{code}", patrimony: "-", description: "{description}" }}'

    new_content = re.sub(pattern, replacer, content)

    if content == new_content:
        print("No matches found. Already migrated?")
    else:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Migration via Python finished successfully!")

except Exception as e:
    print(f"CRITICAL ERROR: {str(e)}")
    exit(1)
