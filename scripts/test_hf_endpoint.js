/**
 * Hugging Face Dynamic Scenario Endpoint Tester
 * Run: node scripts/test_hf_endpoint.js [optional_token]
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// Read token from CLI argument, functions/.env, or root .env
let token = process.argv[2];
if (!token) {
    try {
        const envPath = path.join(__dirname, '..', 'functions', '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(/HF_TOKEN=([^\r\n]+)/);
            if (match) token = match[1].trim();
        }
    } catch {}
}

if (!token) {
    console.error('❌ No HF_TOKEN provided. Pass as arg or set in functions/.env');
    process.exit(1);
}

console.log('🔍 Testing Hugging Face Token:', token.slice(0, 7) + '...' + token.slice(-4));

// 1. Verify Token Permissions via whoami
const whoamiReq = https.request({
    hostname: 'huggingface.co',
    path: '/api/whoami-v2',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            console.log('👤 Hugging Face User:', data.name || 'Unknown');
            console.log('🔑 Token Role:', data?.auth?.accessToken?.role || data?.auth?.type);
            const fineGrained = data?.auth?.accessToken?.fineGrained;
            if (fineGrained) {
                console.log('🔒 Permissions:', JSON.stringify(fineGrained.scoped?.[0]?.permissions || []));
            }
        } catch {}

        testInferenceRouter();
    });
});
whoamiReq.on('error', (err) => {
    console.error('Network error checking whoami:', err.message);
    testInferenceRouter();
});
whoamiReq.end();

function testInferenceRouter() {
    console.log('\n🚀 Testing dynamic scenario generation on router.huggingface.co/v1 ...');
    
    const payload = JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct:fastest',
        messages: [
            {
                role: 'system',
                content: 'You are an expert CDL scenario designer for a Duolingo-style game. Return JSON only with scenarioTitle, character, storyText, question, options (3 choices with id, text, isCorrect, feedback), and fmcsaRule.'
            },
            {
                role: 'user',
                content: 'Create a dynamic CDL emergency scenario for category "air_brakes" on a mountain downgrade.'
            }
        ],
        temperature: 0.7,
        max_tokens: 600,
        response_format: { type: 'json_object' }
    });

    const req = https.request({
        hostname: 'router.huggingface.co',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
            console.log(`📡 Response Status: ${res.statusCode} ${res.statusMessage}`);
            try {
                const parsed = JSON.parse(responseData);
                if (res.statusCode === 200) {
                    console.log('\n🎉 SUCCESS! Hugging Face Router returned live scenario:');
                    console.log(parsed.choices?.[0]?.message?.content);
                } else {
                    console.log('\n⚠️ Hugging Face Error:', JSON.stringify(parsed, null, 2));
                    if (parsed.error && parsed.error.includes('permissions')) {
                        console.log('\n👉 NOTE: This token was created with "Read-Only" permissions.');
                        console.log('   To enable AI inference, create a token with the "Inference" preset at:');
                        console.log('   https://huggingface.co/settings/tokens/new?preset=inference');
                    }
                }
            } catch (e) {
                console.log('Raw output:', responseData);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Request Error:', e.message);
    });

    req.write(payload);
    req.end();
}
