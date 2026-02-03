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

    const models = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-2.0-pro-exp',
        'gemini-2.0-flash-thinking-exp',
        'gemini-2.0-flash-exp'
    ];

    console.log('Testing 2.0 Series models...');
    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            console.log(`✅ ${modelName}: SUCCESS`);
        } catch (e) {
            console.log(`❌ ${modelName}: ${e.message.split('\n')[0]}`);
        }
    }
}

listModels();
