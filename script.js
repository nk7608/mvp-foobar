document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const scriptOutput = document.getElementById('script-output');
    const copyBtn = document.getElementById('copy-btn');
    const timestampContainer = document.getElementById('timestamp-container');
    const timestampOutput = document.getElementById('timestamp-output');

    // --- API Configuration ---
    const openRouterApiKey = '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'; // <-- IMPORTANT: Make sure your key is still here
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    // --- SCRIPT GENERATION ---
    const generateScript = async () => {
        const userPrompt = promptInput.value;
        if (!userPrompt.trim()) {
            scriptOutput.textContent = 'Please enter a task description first.';
            return;
        }

        scriptOutput.textContent = 'Generating script...';
        generateBtn.disabled = true;
        copyBtn.classList.add('hidden');
        timestampContainer.classList.add('hidden');

        try {
        // THE CHANGE IS HERE: We now call our OWN function
        const apiUrl = '/.netlify/functions/api-proxy';

        const response = await fetch(apiUrl, {
            method: 'POST',
            // The body now only needs the prompt
            body: JSON.stringify({ userPrompt: userPrompt })
        });

        if (!response.ok) {
            throw new Error(`Proxy Error: ${response.statusText}`);
        }

        const data = await response.json();
        const generatedScript = data.choices[0].message.content;

        // The rest of the function remains the same...
        scriptOutput.textContent = generatedScript;
        timestampOutput.textContent = new Date().toLocaleString();
        timestampContainer.classList.remove('hidden');
        copyBtn.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        scriptOutput.textContent = `An error occurred. Check console for details. \n\n${error.message}`;
    } finally {
        generateBtn.disabled = false;
    }
};

    generateBtn.addEventListener('click', generateScript);

    // --- COPY BUTTON LOGIC ---
    copyBtn.addEventListener('click', () => {
        const textToCopy = scriptOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            copyBtn.textContent = 'Error';
        });
    });

    // --- DEPLOYMENT SIMULATION ---
    const deployBtn = document.getElementById('deploy-btn');
    const logOutput = document.getElementById('log-output');
    const serverCheckboxes = document.querySelectorAll('#server-list input[type="checkbox"]');
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const simulateDeployment = async () => {
        deployBtn.disabled = true;
        logOutput.textContent = '';
        const selectedServers = Array.from(serverCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => document.querySelector(`label[for="${checkbox.id}"]`).textContent);

        if (selectedServers.length === 0) {
            logOutput.textContent = 'Error: No servers selected for deployment.';
            deployBtn.disabled = false;
            return;
        }
        logOutput.textContent = 'Initializing deployment...\n';
        try {
            for (const serverName of selectedServers) {
                logOutput.textContent += `\nDeploying to ${serverName}...`;
                await delay(1500);
                logOutput.textContent += ` ✅ Done.`;
            }
            logOutput.textContent += `\n\nDeployment simulation complete.`;
        } catch (error) {
            logOutput.textContent += '\n❌ A simulation error occurred.';
            console.error("Simulation Error:", error);
        } finally {
            deployBtn.disabled = false;
        }
    };
    deployBtn.addEventListener('click', simulateDeployment);
});