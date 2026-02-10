/**
 * Vercel Serverless Function: GET from Upstash Redis
 */
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { key } = req.query;

    if (!key) {
        return res.status(400).json({ error: 'Missing key parameter' });
    }

    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
        console.error('Upstash credentials not found in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await fetch(`${UPSTASH_URL}/get/${key}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${UPSTASH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Upstash GET failed: ${response.statusText}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('GET error:', error);
        return res.status(500).json({ error: error.message });
    }
}
