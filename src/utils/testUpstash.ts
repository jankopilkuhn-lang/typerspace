/**
 * Test Upstash Connection
 * Führe diese Funktion in der Browser-Console aus, um die Verbindung zu testen
 */

import { upstashClient } from '../services/UpstashClient';

export async function testUpstashConnection() {
    console.group('🧪 Upstash Connection Test');

    // Check if configured
    console.log('1. Checking configuration...');
    console.log('   Is Configured:', upstashClient.isConfigured());
    console.log('   URL:', process.env.UPSTASH_REDIS_REST_URL);
    console.log('   Token:', process.env.UPSTASH_REDIS_REST_TOKEN ? '✓ Present' : '✗ Missing');

    if (!upstashClient.isConfigured()) {
        console.error('❌ Upstash is not configured. Check your .env file.');
        console.groupEnd();
        return;
    }

    // Test SET
    console.log('\n2. Testing SET operation...');
    try {
        await upstashClient.set('test_key', JSON.stringify({ test: 'Hello from TyperSpace!', timestamp: Date.now() }));
        console.log('✅ SET successful');
    } catch (error: any) {
        console.error('❌ SET failed:', error.message);
        console.error('   Full error:', error);

        // Check for CORS error
        if (error.message.includes('CORS') || error.message.includes('fetch')) {
            console.error('⚠️  This looks like a CORS error!');
            console.error('   Solution: You need a backend proxy for Upstash.');
        }
        console.groupEnd();
        return;
    }

    // Test GET
    console.log('\n3. Testing GET operation...');
    try {
        const value = await upstashClient.get('test_key');
        console.log('✅ GET successful');
        console.log('   Value:', value);
    } catch (error: any) {
        console.error('❌ GET failed:', error.message);
    }

    // Test highscore key
    console.log('\n4. Testing highscore key...');
    try {
        const exists = await upstashClient.exists('typerspace_highscores');
        console.log('   Key exists:', exists);

        if (exists) {
            const data = await upstashClient.get('typerspace_highscores');
            console.log('   Current data:', data ? JSON.parse(data) : null);
        }
    } catch (error: any) {
        console.error('❌ Failed:', error.message);
    }

    console.log('\n✅ Test completed!');
    console.groupEnd();
}

// Make it available globally in browser console
(window as any).testUpstash = testUpstashConnection;
