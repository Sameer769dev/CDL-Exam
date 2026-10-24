/**
 * 100% FREE AI Tester (Llama-3.3-70B via Groq)
 * Run: node scripts/test_free_groq.js [YOUR_GROQ_KEY]
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

let apiKey = process.argv[2];
if (!apiKey) {
    try {
        const envPath = path.join(__dirname, '..', 'functions', '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(/GROQ_API_KEY=([^\r\n]+)/);
            if (match) apiKey = match[1].trim();
        }
    } catch {}
}

if (!apiKey) {
    console.log('\n❌ No GROQ_API_KEY found.');
    console.log('👉 Get a 100% FREE key in 10 seconds (no credit card required):');
    console.log('   https://console.groq.com/keys\n');
    console.log('Then run: node scripts/test_free_groq.js gsk_yourKeyHere');
    process.exit(1);
}

console.log('🚀 Testing 100% FREE AI on Groq Cloud (qwen/qwen3.8-27b)...');

const payload = JSON.stringify({
    model: 'qwen/qwen3.8-27b',
    messages: [
        {
            role: 'system',
            content: 'You are Diesel Dan, a CDL mentor for a Duolingo-style app. Return strictly valid json with: scenarioTitle, character, storyText, question, options (3 choices with id, text, isCorrect, feedback), and fmcsaRule.'
        },
        {
            role: 'user',
            content: 'Create an exciting CDL air brakes mountain downgrade emergency scenario in json format.'
        }
    ],
    temperature: 0.7,
    max_tokens: 800,
    response_format: { type: 'json_object' }
});

const req = https.request({
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`📡 Status: ${res.statusCode} ${res.statusMessage}`);
        try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200) {
                console.log('\n🎉 SUCCESS! Live 100% Free Llama-3.3-70B Scenario Generated:');
                console.log(parsed.choices[0].message.content);
            } else {
                console.log('API Error:', JSON.stringify(parsed, null, 2));
            }
        } catch {
            console.log('Output:', data);
        }
    });
});

req.on('error', e => console.error('Network Error:', e.message));
req.write(payload);
req.end();
