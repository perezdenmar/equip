import axios from 'axios';

async function runTests() {
    const baseUrl = 'http://localhost:5000';

    console.log('--- DETAILED API VERIFICATION ---');

    try {
        console.log('1. Checking /health...');
        const health = await axios.get(`${baseUrl}/health`);
        console.log('   Health Status:', health.status, health.data);

        console.log('2. Checking /api/announcements...');
        // Note: announcements usually requires admin auth in the route file, 
        // but let's see why the direct test worked (maybe it doesn't have the middleware applied correctly or it's a different route?)
        // WAIT: announcements.js has router.get('/', authenticateToken, authorizeRoles('ADMIN'), ...)
        // My previous node -e call worked WITHOUT a token? That's suspicious.
        const announcements = await axios.get(`${baseUrl}/api/announcements`).catch(e => {
            console.log('   Announcements Error (Expected if Protected):', e.response ? e.response.status : e.message);
            return { data: [] };
        });
        if (announcements.status === 200) {
            console.log('   Announcements Data Count:', announcements.data.length);
        }

        console.log('3. Checking /api/qualifications...');
        const quals = await axios.get(`${baseUrl}/api/qualifications`);
        console.log('   Qualifications Status:', quals.status);
        console.log('   Qualifications Data Count:', quals.data.length);
        if (quals.data.length > 0) {
            console.log('   First Qualification:', quals.data[0].title, '(' + quals.data[0].code + ')');
        } else {
            console.log('   WARNING: No qualifications returned despite records in DB.');
        }

    } catch (err) {
        console.error('--- TEST RUN FAILED ---');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error('Message:', err.message);
        }
    }
}

runTests();
