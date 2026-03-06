/**
 * cacheService.js
 * An ultra-fast, in-memory generic cache repository.
 * Holds pre-computed API aggregations natively in RAM to ensure < 10ms database response times
 * and prevent continuous rate-limit exhaustion against external APis like RapidAPI.
 */

const cache = {
    jobs: {
        data: null,
        lastUpdated: null
    },
    courses: {
        data: null,
        lastUpdated: null
    }
};

export const setCachedJobs = (jobsArray) => {
    cache.jobs.data = jobsArray;
    cache.jobs.lastUpdated = new Date();
    console.log(`[CacheService] Jobs cache updated successfully with ${jobsArray.length} items at ${cache.jobs.lastUpdated.toISOString()}`);
};

export const getCachedJobs = () => {
    return cache.jobs;
};

export const setCachedCourses = (coursesArray) => {
    cache.courses.data = coursesArray;
    cache.courses.lastUpdated = new Date();
    console.log(`[CacheService] Courses cache updated successfully with ${coursesArray.length} items at ${cache.courses.lastUpdated.toISOString()}`);
};

export const getCachedCourses = () => {
    return cache.courses;
};
