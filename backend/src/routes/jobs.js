import express from 'express';
import { aggregateJobs } from '../services/jobAggregator.js';
import { getCachedJobs, setCachedJobs } from '../services/cacheService.js';

const router = express.Router();

// Fetch aggregated jobs from multiple sources (Remotive, Arbeitnow, Local Mock)
router.get('/', async (req, res) => {
    try {
        const { query = '' } = req.query;
        let jobs = [];

        // 1. Attempt rapid read from global memory cache
        const cache = getCachedJobs();
        if (cache && cache.data && cache.data.length > 0) {
            console.log('[JobsAPI] Serving from Lightning Memory Cache.');
            jobs = cache.data;
        } else {
            // 2. Fallback to manual aggregate if cache hasn't hydrated yet
            console.log('[JobsAPI] Cache Empty. Executing real-time aggregation.');
            jobs = await aggregateJobs('');
            setCachedJobs(jobs); // Populate immediately for the next request
        }

        // 3. Perform completely internal filtering locally
        if (query) {
            const normalizedQuery = query.toLowerCase();
            jobs = jobs.filter(job =>
                job.title.toLowerCase().includes(normalizedQuery) ||
                job.company.toLowerCase().includes(normalizedQuery) ||
                job.location.toLowerCase().includes(normalizedQuery)
            );
        }

        // Limit results to 30 to prevent frontend lag
        const limitedJobs = jobs.slice(0, 30);

        res.json({ jobs: limitedJobs });
    } catch (error) {
        console.error('Failed to aggregate jobs:', error);
        res.status(500).json({ error: 'Failed to fetch job search results.' });
    }
});

export default router;
