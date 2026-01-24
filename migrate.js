const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ================= CONFIGURATION =================
// Use 127.0.0.1 to avoid common 'localhost' connection issues
const STRAPI_URL = 'http://127.0.0.1:1337';
const API_TOKEN = 'e4ef710e3925dc994576910402f299e4d7123c8353fe9559440b4acfb4658c8f18d9108e611c19426cab4ea951a18061cff89d9ba9fb19059774f81e6883a79cfc0f10a6f9da0a626472d710e976c351de70699a7ede6f2ddbcbd658c07b0520db1697a23756d0caf11304c194b0fe9c4d18b2c27b90619cc395d900c378457e';
const FILE_NAME = 'bulk_basic_data_activities.json';

// FIX: We use the DOCUMENT ID from your screenshot
// This tells Strapi exactly which category to link.
const CATEGORY_DOC_ID = 'jt4k35dc82hngfoxx2htyjkq';
// =================================================

const api = axios.create({
    baseURL: STRAPI_URL + '/api',
    headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

const mapItinerary = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => ({
        time: item.time || '',
        title: item.title || '',
        description: item.description || '',
    }));
};

const mapFaqs = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => ({
        question: item.question || '',
        answer: item.answer || '',
    }));
};

async function migrate() {
    try {
        const rawData = fs.readFileSync(path.join(__dirname, FILE_NAME), 'utf8');
        const json = JSON.parse(rawData);
        const products = json.data.products.nodes;

        console.log(`Found ${products.length} activities to migrate...`);

        for (const product of products) {
            console.log(`\nProcessing: ${product.slug}`);

            const commonData = product.activityData;
            const enData = commonData.en;

            // 1. Prepare Data
            const entryPayload = {
                data: {
                    slug: product.slug,
                    internalName: product.name,
                    maxPersons: parseInt(commonData.max_persons) || null,
                    publicPrice: parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0,

                    // LINKING THE CATEGORY BY DOCUMENT ID
                    category: CATEGORY_DOC_ID,

                    // English Content
                    title: enData.title,
                    overview: enData.overview,
                    duration: enData.duration,
                    highlights: enData.highlights,
                    inclusions: enData.inclusions,
                    exclusions: enData.exclusions,
                    itinerary: mapItinerary(enData.itinerary),
                    faqs: mapFaqs(enData.faqs),
                    locale: 'en',
                },
            };

            let docId;

            // 1. Check if entry already exists
            try {
                const existing = await api.get(`/activities?filters[slug][$eq]=${product.slug}`);
                if (existing.data.data && existing.data.data.length > 0) {
                    docId = existing.data.data[0].documentId;
                    console.log(`   > SKIPPED CREATION: Entry already exists (DocID: ${docId})`);
                }
            } catch (err) {
                console.log('   > Checking existence failed, trying creation...');
            }

            if (!docId) {
                try {
                    // 2. Create English Entry
                    const createdEntry = await api.post('/activities', entryPayload);

                    // Strapi v5 uses 'documentId' for linking localizations
                    docId = createdEntry.data.data.documentId;

                    console.log(`   > SUCCESS: Created (DocID: ${docId})`);
                } catch (err) {
                    throw err; // Re-throw to be caught by the outer catch block
                }
            }

            try {
                // 3. Add Localizations (French & German)
                for (const lang of ['fr', 'de']) {
                    if (commonData[lang]) {
                        const langData = commonData[lang];
                        // Strapi v5 endpoint: POST /api/activities/:documentId/localizations
                        await api.post(`/activities/${docId}/localizations`, {
                            data: {
                                title: langData.title,
                                overview: langData.overview,
                                duration: langData.duration,
                                highlights: langData.highlights,
                                inclusions: langData.inclusions,
                                exclusions: langData.exclusions,
                                itinerary: mapItinerary(langData.itinerary),
                                faqs: mapFaqs(langData.faqs),
                                locale: lang,
                            }
                        });
                        console.log(`   > Added ${lang}`);
                    }
                }

            } catch (err) {
                // DETAILED ERROR PRINTING
                if (err.response) {
                    console.error(`   X STRAPI ERROR (${err.response.status}):`);
                    // Strapi v5 error details are often nested
                    const details = err.response.data.error?.details?.errors || err.response.data.error;
                    console.error(JSON.stringify(details, null, 2));
                } else {
                    console.error(`   X NETWORK/CODE ERROR:`, err.message);
                }
            }
        }
        console.log('\n--- Migration Complete ---');

    } catch (error) {
        console.error('Fatal Script Error:', error);
    }
}

migrate();