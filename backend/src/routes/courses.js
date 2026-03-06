import express from 'express';
import { getSimulatedCourses } from '../services/courseAggregator.js';
import { getCachedCourses, setCachedCourses } from '../services/cacheService.js';

const router = express.Router();

// GET /api/courses
router.get('/', async (req, res) => {
    try {
        const { provider, search } = req.query;

        // 1. Attempt rapid read from global memory cache
        const cache = getCachedCourses();
        let courses = cache.data;

        if (!courses || courses.length === 0) {
            console.log('[CoursesAPI] Cache Empty. Executing real-time simulation.');
            courses = await getSimulatedCourses();
            setCachedCourses(courses);
        } else {
            console.log('[CoursesAPI] Serving from Lightning Memory Cache.');
        }

        // 2. Apply fast in-memory filters
        if (provider && provider !== 'All') {
            courses = courses.filter(c => c.provider.toLowerCase() === provider.toLowerCase());
        }

        if (search) {
            const query = search.toLowerCase();
            courses = courses.filter(c =>
                c.title.toLowerCase().includes(query) ||
                c.skills.some(s => s.toLowerCase().includes(query))
            );
        }

        res.json(courses);
    } catch (error) {
        console.error('Course fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch online courses.' });
    }
});

export default router;
