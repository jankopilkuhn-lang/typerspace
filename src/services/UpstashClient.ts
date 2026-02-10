/**
 * Upstash Redis REST API Client (via Proxy)
 * Handles communication with Upstash Redis database through a local proxy server
 */

export class UpstashClient {
    private readonly proxyUrl: string;
    private readonly isProduction: boolean;

    constructor() {
        // Determine proxy URL based on environment
        // In production (Vercel), use relative API routes
        // In development, use local proxy server
        this.isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        this.proxyUrl = this.isProduction
            ? '/api/redis'  // Vercel serverless functions
            : 'http://localhost:3001/api/redis';  // Local proxy server

        console.log(`Upstash client initialized (${this.isProduction ? 'Vercel' : 'local'} mode)`);
        console.log(`Proxy URL: ${this.proxyUrl}`);
    }

    /**
     * Check if Upstash is configured by testing the connection
     */
    public async isConfigured(): Promise<boolean> {
        try {
            // Test connection by checking if API is available
            const response = await fetch(`${this.proxyUrl}/exists/test`, {
                method: 'GET',
            });
            return response.ok;
        } catch (error) {
            console.warn('Upstash API not available, falling back to localStorage');
            return false;
        }
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
