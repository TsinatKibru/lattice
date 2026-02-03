const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in .env');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log('Fetching available models...');
        // The SDK doesn't have a direct listModels but we can try to use a dummy call or check the generativeai service
        // However, a simpler way is to try the common ones one by one or use the REST API via fetch if available.
        // But let's try the most likely names.

        const models = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-1.5-pro',
            'gemini-1.0-pro',
            'gemini-2.0-flash-exp'
        ];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hi');
                console.log(`✅ ${modelName}: SUCCESS`);
            } catch (e) {
                console.log(`❌ ${modelName}: ${e.message.split('\n')[0]}`);
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

listModels();
