/**
 * Vercel Serverless Function: EXISTS check in Upstash Redis
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
        console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('UPSTASH')));
        console.error('UPSTASH_URL:', UPSTASH_URL ? 'set' : 'missing');
        console.error('UPSTASH_TOKEN:', UPSTASH_TOKEN ? 'set' : 'missing');
        return res.status(500).json({
            error: 'Server configuration error',
            debug: {
                url: UPSTASH_URL ? 'set' : 'missing',
                token: UPSTASH_TOKEN ? 'set' : 'missing',
                availableEnvVars: Object.keys(process.env).filter(k => k.includes('UPSTASH'))
            }
        });
    }

    try {
        const response = await fetch(`${UPSTASH_URL}/exists/${key}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${UPSTASH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Upstash EXISTS failed: ${response.statusText}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('EXISTS error:', error);
        return res.status(500).json({ error: error.message });
    }
}
