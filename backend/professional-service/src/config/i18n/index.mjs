import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize i18next with the fs backend
i18next
  .use(Backend)
  .init({
    backend: {
      // Path to load resources from
      loadPath: join(__dirname, 'locales/{{lng}}.json'),
      // Path to save missing resources to
      addPath: join(__dirname, 'locales/{{lng}}.missing.json')
    },
    fallbackLng: 'en',
    preload: ['en', 'es', 'pt'],
    saveMissing: true,
    interpolation: {
      escapeValue: false // not needed for server-side
    }
  });

export default i18next;
