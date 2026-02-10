/**
 * TyperSpace Upstash Proxy Server
 * Umgeht CORS-Probleme bei direkten Browser-Anfragen an Upstash
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Upstash Configuration
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.error('❌ ERROR: Upstash credentials not found in .env file!');
    process.exit(1);
}

console.log('✅ Upstash credentials loaded');
console.log('   URL:', UPSTASH_URL);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', upstash: 'configured' });
});

// GET operation
app.get('/api/redis/get/:key', async (req, res) => {
    const { key } = req.params;

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
        res.json(data);
    } catch (error) {
        console.error('GET error:', error);
        res.status(500).json({ error: error.message });
    }
});

// SET operation
app.post('/api/redis/set/:key', async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;

    try {
        const response = await fetch(`${UPSTASH_URL}/set/${key}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${UPSTASH_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        });

        if (!response.ok) {
            throw new Error(`Upstash SET failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ SET successful: ${key}`);
        res.json(data);
    } catch (error) {
        console.error('SET error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE operation
app.delete('/api/redis/del/:key', async (req, res) => {
    const { key } = req.params;

    try {
        const response = await fetch(`${UPSTASH_URL}/del/${key}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${UPSTASH_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Upstash DEL failed: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('DEL error:', error);
        res.status(500).json({ error: error.message });
    }
});

// EXISTS operation
app.get('/api/redis/exists/:key', async (req, res) => {
    const { key } = req.params;

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
        res.json(data);
    } catch (error) {
        console.error('EXISTS error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 TyperSpace Proxy Server running!`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/health`);
    console.log(`\n📡 Upstash proxy ready. Start your game with: npm start\n`);
});
