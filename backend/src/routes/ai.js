import express from 'express';
import { GoogleGenAI } from '@google/genai';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Initialize the new Gen AI SDK client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Rate limiter: max 20 AI requests per 15 minutes per IP
const aiChatLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many AI requests. Please try again later.' } });

router.post('/chat', aiChatLimiter, async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an AI support assistant for EQUIP (Equip Quantum Upskilling Institute of the Philippines Inc.). Address: National Highway, San Jose, Digos City, Davao del Sur 8002. Contact: 0961-701-8568.\nAnswer the user's inquiry based on this identity.\nUser: ${message}`,
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error('Gemini error:', error);
        res.status(500).json({ error: 'AI encountered an error generating a response.' });
    }
});

export default router;
