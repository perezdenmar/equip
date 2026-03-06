import axios from 'axios';

/**
 * Standardized Job Schema
 * {
 *   id: string,
 *   title: string,
 *   company: string,
 *   location: string,
 *   salary: string,
 *   url: string,
 *   posted: ISO Date String,
 *   source: string,
 *   requiredQualification: string | null
 * }
 */

const fetchRemotiveAsia = async (searchQuery) => {
    try {
        const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchQuery)}`;
        const response = await axios.get(url, { timeout: 5000 });
        let results = response.data.jobs || [];

        // STRICTLY filter for jobs that allow candidates from Asia, Philippines, or Global/Anywhere
        results = results.filter(job => {
            const reqLocation = (job.candidate_required_location || '').toLowerCase();
            return reqLocation.includes('asia') ||
                reqLocation.includes('philippines') ||
                reqLocation.includes('worldwide') ||
                reqLocation.includes('anywhere') ||
                reqLocation.includes('apac');
        });

        return results.slice(0, 15).map(job => ({
            id: `remotive-${job.id}`,
            title: job.title,
            company: job.company_name || 'Confidential Company',
            location: job.candidate_required_location || 'Remote (Asia / Global)',
            salary: job.salary || 'Competitive',
            url: job.url || '#',
            posted: job.publication_date || new Date().toISOString(),
            source: 'Remotive (Asia/Remote)',
            requiredQualification: null
        }));
    } catch (error) {
        console.error('Remotive Fetch Error:', error.message);
        return [];
    }
};

const fetchOpenWebNinjaJobs = async (searchQuery) => {
    try {
        const query = searchQuery ? `${searchQuery} in Philippines` : 'jobs in Philippines';
        const url = 'https://api.openwebninja.com/jsearch/search';
        const response = await axios.get(url, {
            headers: {
                'x-api-key': process.env.OPENWEBNINJA_API_KEY,
                'Accept': '*/*'
            },
            params: {
                query: query,
                page: 1,
                num_pages: 1
            },
            timeout: 8000
        });

        const results = response.data.data || [];

        return results.slice(0, 15).map(job => ({
            id: `own-${job.job_id}`,
            title: job.job_title || 'Unknown Title',
            company: job.employer_name || 'Confidential Company',
            location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'Remote / Unknown',
            salary: job.job_min_salary && job.job_max_salary ? `${job.job_min_salary} - ${job.job_max_salary} ${job.job_salary_currency}` : 'Competitive',
            url: job.job_apply_link || job.job_google_link || '#',
            posted: job.job_posted_at_datetime_utc || new Date().toISOString(),
            source: job.job_publisher || 'OpenWebNinja',
            requiredQualification: null
        }));
    } catch (error) {
        console.error('OpenWebNinja Fetch Error:', error.message);
        return [];
    }
};

const simulatePhilJobNet = (searchQuery) => {
    const query = (searchQuery || '').toLowerCase();
    const mockJobs = [];

    if (query.includes('forklift') || query.includes('heo') || query.includes('equipment') || query.includes('fl')) {
        mockJobs.push(
            {
                id: `pjn-fl-1-${Date.now()}`,
                title: 'Heavy Equipment Operator - Forklift Specialization',
                company: 'Apex Construction Builders PH',
                location: 'Metro Manila, Philippines',
                salary: 'PHP 25,000 - 32,000 / month',
                url: 'https://philjobnet.gov.ph/',
                posted: new Date().toISOString(),
                source: 'PhilJobNet',
                requiredQualification: 'HEO Forklift (NC II)'
            },
            {
                id: `pjn-fl-2-${Date.now()}`,
                title: 'Warehouse Logistics Operator (Forklift Certified)',
                company: 'Global Port Terminals Cebu',
                location: 'Cebu City, Philippines',
                salary: 'PHP 22,000 - 28,000 / month',
                url: 'https://philjobnet.gov.ph/',
                posted: new Date(Date.now() - 86400000 * 2).toISOString(),
                source: 'PhilJobNet',
                requiredQualification: 'HEO Forklift (NC II)'
            }
        );
    }

    if (query.includes('grader') || query.includes('heo') || query.includes('civil') || query.includes('gr')) {
        mockJobs.push(
            {
                id: `pjn-gr-1-${Date.now()}`,
                title: 'Senior Motor Grader Operator',
                company: 'BuildRight Infrastructure Corp.',
                location: 'Davao City, Philippines',
                salary: 'PHP 35,000 - 45,000 / month',
                url: 'https://philjobnet.gov.ph/',
                posted: new Date(Date.now() - 86400000).toISOString(),
                source: 'PhilJobNet',
                requiredQualification: 'HEO Grader (NC II)'
            }
        );
    }

    if (query.includes('weld') || query.includes('smaw') || query.includes('metal')) {
        mockJobs.push(
            {
                id: `pjn-we-1-${Date.now()}`,
                title: 'Structural Welder (SMAW NC II)',
                company: 'SteelCorp Manufacturing Group',
                location: 'Laguna Technopark, Philippines',
                salary: 'PHP 28,000 - 35,000 / month',
                url: 'https://philjobnet.gov.ph/',
                posted: new Date().toISOString(),
                source: 'PhilJobNet',
                requiredQualification: 'SMAW (NC II)'
            }
        );
    }

    // Add a generic Philippine job if the search is very broad but not specific to trades above
    if (mockJobs.length === 0 && (query.includes('developer') || query.includes('data') || query.includes('tech') || query.includes('it') || query === '')) {
        mockJobs.push(
            {
                id: `pjn-tech-1-${Date.now()}`,
                title: 'Junior Web Developer',
                company: 'Manila Tech Solutions',
                location: 'BGC, Taguig, Philippines',
                salary: 'PHP 30,000 - 40,000 / month',
                url: 'https://philjobnet.gov.ph/',
                posted: new Date().toISOString(),
                source: 'PhilJobNet',
                requiredQualification: 'Web Development (NC III)'
            },
            {
                id: `pjn-tech-2-${Date.now()}`,
                title: 'Frontend React Engineer',
                company: 'Outsource Pilipinas Inc.',
                location: 'Makati City, Philippines',
                salary: 'PHP 45,000 - 60,000 / month',
                url: 'https://philjobnet.gov.ph/',
                posted: new Date(Date.now() - 86400000).toISOString(),
                source: 'PhilJobNet',
                requiredQualification: 'Programming (NC IV)'
            }
        );
    }

    return mockJobs;
};

const simulateJapanJobs = (searchQuery) => {
    const query = (searchQuery || '').toLowerCase();
    const mockJobs = [];

    if (query.includes('developer') || query.includes('tech') || query.includes('software') || query.includes('it') || query.includes('japan') || query === '') {
        mockJobs.push(
            {
                id: `jd-tech-1-${Date.now()}`,
                title: 'Full Stack Engineer (React/Node.js)',
                company: 'Tokyo Tech Innovations',
                location: 'Tokyo, Japan (Visa Sponsorship)',
                salary: '¥6,000,000 - ¥8,000,000 / year',
                url: 'https://japan-dev.com/',
                posted: new Date().toISOString(),
                source: 'JapanDev',
                requiredQualification: 'JLPT N3 + Web Development (NC III)'
            },
            {
                id: `td-tech-2-${Date.now()}`,
                title: 'Frontend Developer',
                company: 'Sakura Digital',
                location: 'Osaka, Japan',
                salary: '¥5,000,000 - ¥7,000,000 / year',
                url: 'https://www.tokyodev.com/',
                posted: new Date(Date.now() - 86400000).toISOString(),
                source: 'TokyoDev',
                requiredQualification: 'Bilingual + Programming (NC IV)'
            }
        );
    }

    if (query.includes('care') || query.includes('health') || query.includes('nurse') || query.includes('japan')) {
        mockJobs.push(
            {
                id: `wj-care-1-${Date.now()}`,
                title: 'Certified Caregiver (Specified Skilled Worker)',
                company: 'Sunrise Healthcare Group',
                location: 'Yokohama, Japan',
                salary: '¥3,000,000 - ¥4,000,000 / year',
                url: 'https://www.workjapan.jp/',
                posted: new Date().toISOString(),
                source: 'WorkJapan',
                requiredQualification: 'JLPT N4 + Caregiving (NC II)'
            }
        );
    }

    if (query.includes('weld') || query.includes('metal') || query.includes('manufactur') || query.includes('smaw') || query.includes('japan')) {
        mockJobs.push(
            {
                id: `gp-weld-1-${Date.now()}`,
                title: 'Factory Welder / Metal Worker',
                company: 'Kobe Steel Works Subcontractor',
                location: 'Kobe, Japan',
                salary: '¥3,500,000 - ¥4,500,000 / year',
                url: 'https://jobs.gaijinpot.com/',
                posted: new Date(Date.now() - 86400000 * 2).toISOString(),
                source: 'GaijinPot',
                requiredQualification: 'JLPT N4 + SMAW (NC II)'
            }
        );
    }

    return mockJobs;
};

/**
 * Aggregates focused Asian remote jobs and Local PhilJobNet listings
 */
const aggregateJobs = async (searchQuery) => {
    const isGenericSearch = (!searchQuery || searchQuery.toLowerCase() === 'developer');
    const effectiveQuery = isGenericSearch ? '' : searchQuery;

    // Fetch exclusively from Asia-focused/filtered remote sources
    const [remotiveResults, ownResults] = await Promise.all([
        fetchRemotiveAsia(effectiveQuery),
        fetchOpenWebNinjaJobs(effectiveQuery)
    ]);

    let aggregatedJobs = [...remotiveResults, ...ownResults];

    // Always attempt to inject highly-relevant listing simulators
    const localJobs = simulatePhilJobNet(effectiveQuery);
    const japanJobs = simulateJapanJobs(effectiveQuery);

    // Prioritize local and japan jobs at the top of the array
    aggregatedJobs = [...localJobs, ...japanJobs, ...aggregatedJobs];

    // Sort by Date Posted (Desc)
    aggregatedJobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));

    return aggregatedJobs;
};

export {
    aggregateJobs
};
