const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    return { statusCode: 500, body: "API key not found" };
  }

  try {
    const { userPrompt } = JSON.parse(event.body);

    const siteUrl = event.headers.origin || "https://mvp-foobar-nk.netlify.app";

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-Title": "Foobar MVP",
        },
        body: JSON.stringify({
          model: "openrouter/cypher-alpha:free",
          messages: [
            {
              role: "system",
              content:
                "You are a silent bash script generation engine. Your sole purpose is to generate a complete, safe, and well-commented bash script based on the user's request. CRITICAL: Output ONLY the raw script code. DO NOT include any introductory text, explanations, summaries, key features, or usage guidelines. DO NOT wrap the code in markdown fences like ```bash. The output must be a valid bash script, starting with #!/bin/bash.",
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`OpenRouter API Error: ${JSON.stringify(data)}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Proxy Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
