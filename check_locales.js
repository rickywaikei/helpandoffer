import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const localesDir = path.join(__dirname, 'locales');

console.log('Checking locale files in:', localesDir);

// Check if directory exists
if (!fs.existsSync(localesDir)) {
  console.error('Locales directory does not exist!');
  process.exit(1);
}

// List all files in the directory
const files = fs.readdirSync(localesDir);
console.log('Files in locales directory:', files);

// Check specific locale files
const locales = ['en', 'zh-TW', 'zh-CN'];
locales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    console.log(`Locale file ${locale}.json exists`);
    
    // Check if file is valid JSON
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      console.log(`Locale file ${locale}.json is valid JSON`);
    } catch (error) {
      console.error(`Locale file ${locale}.json is NOT valid JSON:`, error.message);
    }
  } else {
    console.error(`Locale file ${locale}.json does NOT exist`);
  }
});
