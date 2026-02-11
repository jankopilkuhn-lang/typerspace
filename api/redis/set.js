/**
 * Vercel Serverless Function: SET in Upstash Redis
 */
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { key } = req.query;
    const { value } = req.body;

    if (!key) {
        return res.status(400).json({ error: 'Missing key parameter' });
    }

    if (!value) {
        return res.status(400).json({ error: 'Missing value in body' });
    }

    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
        console.error('Upstash credentials not found in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await fetch(`${UPSTASH_URL}/set/${key}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${UPSTASH_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: value,  // Don't stringify again - value is already a JSON string from the client
        });

        if (!response.ok) {
            throw new Error(`Upstash SET failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ SET successful: ${key}`);
        return res.status(200).json(data);
    } catch (error) {
        console.error('SET error:', error);
        return res.status(500).json({ error: error.message });
    }
}
