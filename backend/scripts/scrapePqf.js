import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://pqf.gov.ph/PhQuaR/Qualifications';

async function scrapePqf() {
    let allData = [];
    let page = 1;
    const maxPages = 102; // Expected max pages based on 1518 results

    console.log('Starting PQF qualifications scrape...');

    while (page <= maxPages) {
        try {
            console.log(`Scraping page ${page}...`);
            // Adding a small delay to avoid DDOSing the gov site
            await new Promise(r => setTimeout(r, 500));

            const { data } = await axios.get(`${BASE_URL}?page=${page}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml'
                }
            });
            const $ = cheerio.load(data);
            const rows = $('table tbody tr');

            if (rows.length === 0) {
                console.log(`No more rows found on page ${page}. Stopping.`);
                break;
            }

            rows.each((i, el) => {
                const textNodes = $(el).find('td');
                if (textNodes.length >= 3) {
                    const code = $(textNodes[0]).text().replace(/\s+/g, ' ').trim();
                    const title = $(textNodes[1]).text().replace(/\s+/g, ' ').trim();
                    const descriptor = $(textNodes[2]).text().replace(/\s+/g, ' ').trim();

                    if (code && title) {
                        allData.push({ code, title, descriptor });
                    }
                }
            });

            page++;
        } catch (error) {
            console.error(`Error scraping page ${page}:`, error.message);
            break;
        }
    }

    // Deduplicate just in case
    const uniqueMap = new Map();
    allData.forEach(item => {
        if (!uniqueMap.has(item.code)) {
            uniqueMap.set(item.code, item);
        }
    });
    const uniqueData = Array.from(uniqueMap.values());

    const outPath = path.join(process.cwd(), 'prisma', 'pqf_qualifications.json');
    fs.writeFileSync(outPath, JSON.stringify(uniqueData, null, 2));
    console.log(`Successfully scraped ${uniqueData.length} unique qualifications. Saved to ${outPath}`);
}

scrapePqf();
