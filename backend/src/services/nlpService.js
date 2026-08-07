import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Parses a natural language job search query into structured filters.
 * @param {string} query 
 * @returns {Promise<object>} Structured filters
 */
export async function parseJobQuery(query) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: `Analyze the following job search query and extract structured search parameters.
Return ONLY a JSON object with these keys: 
- title: (string) core job title/role
- seniority: (string) e.g., Junior, Senior, Lead, Internship
- isRemote: (boolean)
- location: (string) specific city/country mentioned
- skills: (string[]) list of technical skills mentioned
- intent: (string) short summary of what the user wants

Query: "${query}"`
                }]
            }],
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error('[NLP] Failed to parse query:', error);
        return { title: query, intent: 'Fallback to raw query search' };
    }
}

/**
 * Scores a job listing against the original user intent.
 * @param {object} job Job data from scraper
 * @param {object} parsedIntent Parsed intent from parseJobQuery
 * @returns {Promise<number>} Relevance score (0.0 to 1.0)
 */
export async function scoreJobRelevance(job, parsedIntent) {
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{
                role: 'user',
                parts: [{
                    text: `Score the relevance of this job listing against the user's search intent.
User Intent: ${parsedIntent.intent}
Job Title: ${job.title}
Job Company: ${job.company}
Job Description Preview: ${job.description?.substring(0, 500)}...

Return ONLY a JSON object: { "relevance": (number between 0 and 1) }`
                }]
            }],
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const result = JSON.parse(response.text);
        return result.relevance || 0;
    } catch (error) {
        console.error('[NLP] Failed to score job:', error);
        return 0.5; // Neutral fallback
    }
}
