import { regions, provinces as rawProvinces, citiesMunicipalities } from 'ph-locations';

// Patch provinces to correct South Cotabato and Sarangani regions
// which are mistakenly mapped to PH-11 (Davao) instead of PH-12 (Soccsksargen) in the native library.
const provinces = rawProvinces.map(p => {
    if (p.name === 'South Cotabato' || p.name === 'Sarangani') {
        return { ...p, region: 'PH-12' };
    }
    return p;
});

export { regions, provinces, citiesMunicipalities };
