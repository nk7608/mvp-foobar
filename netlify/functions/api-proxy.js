// netlify/functions/api-proxy.js

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        return { statusCode: 500, body: 'API key not found' };
    }

    try {
        const { userPrompt } = JSON.parse(event.body);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost',
                'X-Title': 'Foobar MVP'
            },
            body: JSON.stringify({
                model: 'openrouter/cypher-alpha:free',
                messages: [
                    { role: 'system', content: 'You are an expert at writing bash scripts. Generate a safe, well-commented bash script...' },
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`OpenRouter API Error: ${JSON.stringify(data)}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Proxy Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};