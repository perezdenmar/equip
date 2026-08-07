/**
 * RemoteOK Scraper Strategy
 * @param {Page} page Playwright page instance
 * @param {string} query Search terms
 * @returns {Promise<Array>} List of job objects
 */
export async function scrapeRemoteOK(page, query) {
    const url = `https://remoteok.com/remote-${query.toLowerCase().replace(/\s+/g, '-')}-jobs`;
    console.log(`[RemoteOK] Navigating to ${url}`);

    await page.goto(url, { waitUntil: 'networkidle' });

    // RemoteOK uses <tr> rows with class 'job'
    const jobRows = await page.locator('tr.job').all();
    const jobs = [];

    for (const row of jobRows) {
        try {
            const title = await row.locator('h2[itemprop="title"]').textContent();
            const company = await row.locator('h3[itemprop="name"]').textContent();
            const tags = await row.locator('.tag').allTextContents();
            const urlPath = await row.locator('a.preventLink').getAttribute('href');
            const salaryElement = await row.locator('.location').last(); // RemoteOK often puts salary in a 'location' class div
            const salary = await salaryElement.count() > 0 ? await salaryElement.textContent() : null;

            jobs.push({
                title: title.trim(),
                company: company.trim(),
                skillsRequired: tags,
                url: `https://remoteok.com${urlPath}`,
                source: 'remoteok',
                location: 'Remote',
                salary: salary?.includes('$') ? salary.trim() : null,
                postedAt: new Date() // RemoteOK doesn't easily show date in list, will default to now for refresh
            });
        } catch (e) {
            console.warn('[RemoteOK] Failed to parse a row', e.message);
        }
    }

    return jobs;
}
