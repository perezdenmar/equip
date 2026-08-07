/**
 * OnlineJobs.ph Scraper Strategy
 * @param {Page} page Playwright page instance
 * @param {string} query Search terms
 * @returns {Promise<Array>} List of job objects
 */
export async function scrapeOnlineJobs(page, query) {
    const url = `https://www.onlinejobs.ph/jobseekers/jobsearch?search=${encodeURIComponent(query)}`;
    console.log(`[OnlineJobs] Navigating to ${url}`);

    await page.goto(url, { waitUntil: 'networkidle' });

    // OnlineJobs.ph uses .jobpost-cat-box
    const jobBoxes = await page.locator('.jobpost-cat-box').all();
    const jobs = [];

    for (const box of jobBoxes) {
        try {
            const titleElement = box.locator('h4');
            const title = await titleElement.textContent();
            const companyElement = box.locator('.jobpost-company');
            const company = await companyElement.textContent();

            const detailUrl = await box.locator('a').first().getAttribute('href');

            // Extracting salary and location which are often in a p tag with specific text
            const metaInfo = await box.locator('p').allTextContents();
            let salary = null;
            let type = 'Remote'; // OnlineJobs is primarily remote

            for (const text of metaInfo) {
                if (text.includes('₱') || text.includes('$')) salary = text.trim();
            }

            jobs.push({
                title: title.trim(),
                company: company.trim() || 'Hidden Company',
                url: detailUrl.startsWith('http') ? detailUrl : `https://www.onlinejobs.ph${detailUrl}`,
                source: 'onlinejobs',
                location: 'Philippines (Remote)',
                type: 'Remote',
                salary: salary,
                postedAt: new Date()
            });
        } catch (e) {
            console.warn('[OnlineJobs] Failed to parse a box', e.message);
        }
    }

    return jobs;
}
