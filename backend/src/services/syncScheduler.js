import cron from 'node-cron';
import { aggregateJobs } from './jobAggregator.js';
import { getSimulatedCourses } from './courseAggregator.js';
import { setCachedJobs, setCachedCourses } from './cacheService.js';

/**
 * syncScheduler.js
 * Automatically pulls fresh data from external APIs and updates the memory cache.
 */

const runBackgroundSync = async () => {
    console.log('[SyncScheduler] Initiating Background Data Synchronization Sequence...');
    try {
        // Run aggregators concurrently for maximum efficiency
        const [freshJobs, freshCourses] = await Promise.all([
            aggregateJobs(''), // Fetch completely generic / broad jobs pool for caching
            getSimulatedCourses()
        ]);

        if (freshJobs && freshJobs.length > 0) {
            setCachedJobs(freshJobs);
        }

        if (freshCourses && freshCourses.length > 0) {
            setCachedCourses(freshCourses);
        }

        console.log('[SyncScheduler] Background Synchronization Sequence Completed Successfully.');
    } catch (error) {
        console.error('[SyncScheduler] Synchronization Sequence Failed:', error.message);
    }
};

export const initializeScheduler = () => {
    // 1. Run immediately on server boot so the cache isn't empty upon the first user visit
    console.log('[SyncScheduler] Server Boot Detected. Running initial sync...');
    runBackgroundSync();

    // 2. Schedule the Cron Job to run precisely every single day at Midnight server time (00:00)
    // Format: 'Minute Hour DayOfMonth Month DayOfWeek'
    cron.schedule('0 0 * * *', () => {
        console.log('[SyncScheduler] Triggering Daily Midnight Cron Action.');
        runBackgroundSync();
    });

    console.log('[SyncScheduler] Cron Jobs Registered and Active.');
};
