import i18n from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

i18n.configure({
  // Setup locales - add more as needed
  locales: ['en', 'zh-TW', 'zh-CN'],

  // Default locale
  defaultLocale: 'en',

  // Directory where language files will be stored
  directory: path.join(__dirname, '../locales'),

  // Auto reload language files when changed
  autoReload: true,

  // Sync language files across all files
  syncFiles: true,

  // Debug mode to see more information
  debug: true,

  // Cookie name for storing locale preference
  cookie: 'locale',

  // Query parameter to switch locale (e.g., ?lang=en)
  queryParameter: 'lang',

  // Use object notation for translations
  objectNotation: true,

  // Update locale on each request if needed
  updateFiles: false,

  // Detect language from query parameter, cookie, or header
  detectLangFromQueryString: true,
  detectLangFromCookie: true,
  detectLangFromHeader: true,

  // Register global variables
  register: global,

  // Preserve key paths in a deep object
  preserveLegacyCase: false
});

export default i18n;
