const axios = require('axios');

// CONFIG
const STRAPI_URL = 'http://127.0.0.1:1337';
const API_TOKEN = 'e4ef710e3925dc994576910402f299e4d7123c8353fe9559440b4acfb4658c8f18d9108e611c19426cab4ea951a18061cff89d9ba9fb19059774f81e6883a79cfc0f10a6f9da0a626472d710e976c351de70699a7ede6f2ddbcbd658c07b0520db1697a23756d0caf11304c194b0fe9c4d18b2c27b90619cc395d900c378457e'; // <--- PASTE TOKEN

const api = axios.create({
    baseURL: STRAPI_URL + '/api',
    headers: { Authorization: `Bearer ${API_TOKEN}` },
});

async function checkEndpoint(name) {
    console.log(`\n--- Testing Endpoint: /api/${name} ---`);

    // 1. Test GET (Read)
    try {
        const res = await api.get(`/${name}`);
        console.log(`[GET]  ✅ Status ${res.status} (Found!)`);
        console.log(`       Existing entries: ${res.data.data.length}`);
    } catch (err) {
        if (err.response) {
            console.log(`[GET]  ❌ Status ${err.response.status} - ${err.response.statusText}`);
            if (err.response.status === 404) console.log("       -> Name is wrong. This is not the plural ID.");
            if (err.response.status === 403) console.log("       -> Token does not have permission.");
        } else {
            console.log(`[GET]  ❌ Network Error: ${err.message}`);
        }
        return; // Stop if GET fails
    }

    // 2. Test POST (Create) - Dry Run
    // We try to send empty data just to see if it allows the METHOD (not if it accepts the data)
    try {
        await api.post(`/${name}`, { data: {} });
    } catch (err) {
        if (err.response) {
            if (err.response.status === 400) {
                console.log(`[POST] ✅ Endpoint is OPEN! (Returned 400 Bad Request as expected for empty data)`);
                console.log(`       -> USE THIS PLURAL ID: '${name}'`);
            } else if (err.response.status === 405) {
                console.log(`[POST] ⛔ Status 405 (Method Not Allowed)`);
                console.log(`       -> This usually means it is a SINGLE TYPE or a Draft/Publish issue.`);
            } else {
                console.log(`[POST] ❌ Status ${err.response.status} - ${err.response.statusText}`);
            }
        }
    }
}

async function run() {
    console.log("Diagnosing Strapi Connection...");

    // Try common variations
    await checkEndpoint('activities');      // Standard Plural
    await checkEndpoint('activity');        // Singular
    await checkEndpoint('activities-list'); // Accidental name

    console.log("\n--- Diagnosis Complete ---");
}

run();