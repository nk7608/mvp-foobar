// netlify/functions/api-proxy.js

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Get the API key from the secure environment variables
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        return { statusCode: 500, body: 'API key not found' };
    }

    try {
        // Get the user's prompt from the body of the request from our frontend
        const { userPrompt } = JSON.parse(event.body);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openrouter/cypher-alpha:free',
                messages: [
                    { role: 'system', content: 'You are an expert at writing bash scripts...' }, // Your system prompt
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        const data = await response.json();

        // Send the response from OpenRouter back to our frontend
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};