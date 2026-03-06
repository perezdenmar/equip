import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
const resources = {
    en: {
        translation: {
            "nav": {
                "home": "Home",
                "qualifications": "Qualifications",
                "jobs": "Jobs",
                "login": "Login via Gmail",
            },
            "hero": {
                "title": "Empowering the Future Workforce",
                "subtitle": "Equip Quantum Upskilling Institute of the Philippines Inc.",
                "description": "Bold. Clean. Professional. Discover highly sought-after qualifications and seamlessly transition into top-tier tech jobs.",
                "cta": "Explore Qualifications",
            }
        }
    },
    fil: {
        translation: {
            "nav": {
                "home": "Home",
                "qualifications": "Mga Kwalipikasyon",
                "jobs": "Trabaho",
                "login": "Mag-login via Gmail",
            },
            "hero": {
                "title": "Pinapalakas ang Makabagong Lakas Paggawa",
                "subtitle": "Equip Quantum Upskilling Institute of the Philippines Inc.",
                "description": "Matapang. Malinis. Propesyonal. Tuklasin ang mga kinakailangang kwalipikasyon at maayos na lumipat sa mga nangungunang trabaho sa teknolohiya.",
                "cta": "Tingnan ang Kwalipikasyon",
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
