/**
 * Indeed Scraper Strategy
 * @param {Page} page Playwright page instance
 * @param {string} query Search terms
 * @returns {Promise<Array>} List of job objects
 */
export async function scrapeIndeed(page, query) {
    const url = `https://ph.indeed.com/jobs?q=${encodeURIComponent(query)}&l=Remote`;
    console.log(`[Indeed] Navigating to ${url}`);

    await page.goto(url, { waitUntil: 'networkidle' });

    // Indeed often has "cookie" or "login" modals. Simple attempt to bypass.
    try {
        await page.click('button.icl-CloseButton', { timeout: 2000 });
    } catch (e) { }

    // Indeed uses results with class 'result' or 'job_seen_beacon'
    const jobCards = await page.locator('.job_seen_beacon').all();
    const jobs = [];

    for (const card of jobCards) {
        try {
            const title = await card.locator('h2.jobTitle').textContent();
            const company = await card.locator('[data-testid="company-name"]').textContent();
            const location = await card.locator('[data-testid="text-location"]').textContent();

            // Extract URL from the link within h2.jobTitle
            const link = await card.locator('h2.jobTitle a').getAttribute('href');

            // Salay is often in a specific div
            const salary = await card.locator('.salary-snippet-container').count() > 0
                ? await card.locator('.salary-snippet-container').textContent()
                : null;

            jobs.push({
                title: title.replace('new', '').trim(),
                company: company.trim(),
                location: location.trim(),
                url: link.startsWith('http') ? link : `https://ph.indeed.com${link}`,
                source: 'indeed',
                salary: salary,
                postedAt: new Date()
            });
        } catch (e) {
            console.warn('[Indeed] Failed to parse a card', e.message);
        }
    }

    return jobs;
}
