import axios from 'axios';

async function verify() {
    try {
        console.log('Testing /health...');
        const health = await axios.get('http://localhost:5000/health');
        console.log('Health:', health.data);

        console.log('Testing /api/qualifications...');
        const quals = await axios.get('http://localhost:5000/api/qualifications');
        console.log('Qualifications found:', quals.data.length);

        if (health.data.status === 'ok' && quals.data.length >= 0) {
            console.log('VERIFICATION SUCCESSFUL: API and DB are connected and returning data.');
        } else {
            console.error('VERIFICATION FAILED: Unexpected response format.');
            process.exit(1);
        }
    } catch (err) {
        console.error('VERIFICATION FAILED:', err.message);
        process.exit(1);
    }
}

verify();
