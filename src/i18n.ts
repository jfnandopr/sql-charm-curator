import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enUS from './locales/en-US.json';
import ptBR from './locales/pt-BR.json';
import deDE from './locales/de-DE.json';
import frFR from './locales/fr-FR.json';
import zhCN from './locales/zh-CN.json';
import jaJP from './locales/ja-JP.json';
import esES from './locales/es-ES.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            'en': { translation: enUS },
            'en-US': { translation: enUS },
            'pt': { translation: ptBR },
            'pt-BR': { translation: ptBR },
            'de': { translation: deDE },
            'de-DE': { translation: deDE },
            'fr': { translation: frFR },
            'fr-FR': { translation: frFR },
            'zh': { translation: zhCN },
            'zh-CN': { translation: zhCN },
            'ja': { translation: jaJP },
            'ja-JP': { translation: jaJP },
            'es': { translation: esES },
            'es-ES': { translation: esES }
        },
        fallbackLng: 'en',
        detection: {
            order: ['navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage']
        },
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
