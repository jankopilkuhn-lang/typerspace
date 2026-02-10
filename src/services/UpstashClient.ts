/**
 * Upstash Redis REST API Client (via Proxy)
 * Handles communication with Upstash Redis database through a local proxy server
 */

export class UpstashClient {
    private readonly proxyUrl: string = 'http://localhost:3001/api/redis';
    private readonly configured: boolean;

    constructor() {
        // Check if Upstash is configured via environment variables
        this.configured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

        if (!this.configured) {
            console.warn('Upstash credentials not found. Falling back to localStorage.');
        } else {
            console.log('Upstash client configured (via proxy)');
        }
    }

    /**
     * Check if Upstash is configured
     */
    public isConfigured(): boolean {
        return this.configured;
    }

    /**
     * Get value from Redis (via proxy)
     */
    public async get(key: string): Promise<string | null> {
        try {
            const response = await fetch(`${this.proxyUrl}/get/${key}`);

            if (!response.ok) {
                throw new Error(`Proxy GET failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Upstash GET error:', error);
            throw error;
        }
    }

    /**
     * Set value in Redis (via proxy)
     */
    public async set(key: string, value: string): Promise<void> {
        try {
            const response = await fetch(`${this.proxyUrl}/set/${key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value }),
            });

            if (!response.ok) {
                throw new Error(`Proxy SET failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Upstash SET error:', error);
            throw error;
        }
    }

    /**
     * Delete value from Redis (via proxy)
     */
    public async del(key: string): Promise<void> {
        try {
            const response = await fetch(`${this.proxyUrl}/del/${key}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Proxy DEL failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Upstash DEL error:', error);
            throw error;
        }
    }

    /**
     * Check if key exists (via proxy)
     */
    public async exists(key: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.proxyUrl}/exists/${key}`);

            if (!response.ok) {
                throw new Error(`Proxy EXISTS failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result === 1;
        } catch (error) {
            console.error('Upstash EXISTS error:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const upstashClient = new UpstashClient();
