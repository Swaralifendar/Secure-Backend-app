const axios = require('axios');

// Your API endpoint (use your ngrok URL or localhost)
// const API_URL = 'http://localhost:5001/api/auth/login';

// The email you want to attack (should already be registered)
const TEST_EMAIL = 'newdummyuser1@gmail.com';
const TEST_PASSWORD = 'abc@123';

// Number of attempts you want to simulate
const ATTEMPTS = 10;
const DELAY_MS = 1000; // 1 second between each request

// Automatically get ngrok public URL
const getNgrokUrl = async () => {
    try {
        const res = await axios.get('http://localhost:4040/api/tunnels');
        const httpsTunnel = res.data.tunnels.find(tunnel => tunnel.proto === 'https');
        if (!httpsTunnel) throw new Error('No HTTPS tunnel found');
        return `${httpsTunnel.public_url}/api/auth/login`;
    } catch (err) {
        console.error('Error fetching ngrok URL:', err.message);
        process.exit(1);
    }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const runBruteForceSimulation = async () => {
    const API_URL = await getNgrokUrl();
    console.log(`Starting brute force simulation on ${API_URL}`);
    for (let i = 1; i <= ATTEMPTS; i++) {
        try {
            const response = await axios.post(API_URL, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            console.log(`Attempt ${i}: Status ${response.status} - ${response.data.message || 'Success'}`);
        } catch (error) {
            if (error.response) {
                console.log(`Attempt ${i}: Status ${error.response.status} - ${error.response.data.message}`);
            } else {
                console.error(`Attempt ${i}: Network Error`);
            }
        }
          await delay(DELAY_MS); // wait 1 second before the next attempt
    }
};

runBruteForceSimulation();
