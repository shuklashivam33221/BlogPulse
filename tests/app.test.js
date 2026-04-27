import request from 'supertest';
import app from '../index.js';

describe('API Health and Base Routes', () => {
    
    // Test 1: Does the health endpoint work?
    it('should return 200 on /health', async () => {
        const response = await request(app).get('/health');
        
        // We expect the status code to be 200 (OK)
        expect(response.statusCode).toBe(200);
        
        // We expect the JSON body to have our exact message
        expect(response.body.message).toBe("BlogPulse server is running smoothly");
    });

    // Test 2: Does the root URL redirect to swagger docs?
    it('should redirect the root URL to /api-docs', async () => {
        const response = await request(app).get('/');
        
        // 302 is the HTTP status code for a Redirect
        expect(response.statusCode).toBe(302);
        expect(response.header.location).toBe('/api-docs');
    });

    // Test 3: Does it handle 404 routes properly?
    it('should return 404 for unknown routes', async () => {
        const response = await request(app).get('/api/fake-route-that-does-not-exist');
        expect(response.statusCode).toBe(404);
    });
});
