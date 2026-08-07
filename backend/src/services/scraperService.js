import { chromium } from 'playwright-core';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const SBR_WS_ENDPOINT = process.env.BRIGHT_DATA_WS; // e.g., wss://brd-customer-...

/**
 * Generates a consistent hash for a job listing to prevent duplicates.
 * @param {object} job
 * @returns {string} 
 */
export function generateDedupeHash(job) {
    const title = (job.title || '').toLowerCase().trim();
    const company = (job.company || '').toLowerCase().trim();
    const location = (job.location || '').toLowerCase().trim().replace(/remote|hybrid/g, '').trim();

    const rawString = `${title}|${company}|${location}`;
    return crypto.createHash('md5').update(rawString).digest('hex');
}

/**
 * Connects to the Bright Data Scraping Browser via Playwright.
 * @returns {Promise<Browser>}
 */
export async function connectBrowser() {
    if (!SBR_WS_ENDPOINT) {
        console.warn('[Scraper] BRIGHT_DATA_WS not found. Falling back to local chromium.');
        // Fallback to local if endpoint is missing (for dev)
        return await chromium.launch({ headless: true });
    }

    console.log('[Scraper] Connecting to Bright Data Scraping Browser...');
    return await chromium.connectOverCDP(SBR_WS_ENDPOINT);
}

/**
 * Base method to run a specific scraper strategy.
 * @param {Function} scraperFn 
 * @param {string} query 
 * @returns {Promise<Array>}
 */
export async function runScraper(scraperFn, query) {
    let browser;
    try {
        browser = await connectBrowser();
        const context = await browser.newContext();
        const page = await context.newPage();

        const results = await scraperFn(page, query);
        return results.map(job => ({
            ...job,
            dedupeHash: generateDedupeHash(job)
        }));
    } catch (error) {
        console.error(`[Scraper] Error during scraping:`, error);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}
