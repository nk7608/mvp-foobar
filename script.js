document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    let servers = [];

    // --- DOM ELEMENT SELECTION ---
    // Script Generation
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const scriptOutput = document.getElementById('script-output');
    const copyBtn = document.getElementById('copy-btn');
    const timestampContainer = document.getElementById('timestamp-container');
    const timestampOutput = document.getElementById('timestamp-output');

    // Server Management
    const addServerBtn = document.getElementById('add-server-btn');
    const serverNameInput = document.getElementById('server-name-input');
    const serverIpInput = document.getElementById('server-ip-input');
    const serverListDiv = document.getElementById('server-list');

    // Deployment
    const deployBtn = document.getElementById('deploy-btn');
    const logOutput = document.getElementById('log-output');

    // =================================================================
    // --- FEATURE: MOCK SERVER MANAGEMENT ---
    // =================================================================

    const renderServerList = () => {
        serverListDiv.innerHTML = '';
        if (servers.length === 0) {
            // BUG FIX (Scenario 1): Explicitly add the "No servers" message.
            serverListDiv.innerHTML = '<p>No servers added yet.</p>';
            return;
        }
        servers.forEach(server => {
            const isConnected = server.status === 'connected';
            const isConnecting = server.status === 'connecting';
            const serverElement = document.createElement('div');
            serverElement.className = 'server-item';
            serverElement.innerHTML = `
                <input type="checkbox" id="server-check-${server.id}" data-id="${server.id}" ${isConnected ? '' : 'disabled'}>
                <div class="server-info">
                    <div class="server-name">${server.name}</div>
                    <div class="server-ip">${server.ip}</div>
                </div>
                <div class="status-indicator">
                    <div class="status-dot status-${server.status}"></div>
                    <span>${server.status.charAt(0).toUpperCase() + server.status.slice(1)}</span>
                </div>
                <button class="connect-btn" data-id="${server.id}" ${isConnected || isConnecting ? 'disabled' : ''}>
                    ${isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect'}
                </button>
            `;
            serverListDiv.appendChild(serverElement);
        });
    };

    addServerBtn.addEventListener('click', () => {
        const name = serverNameInput.value.trim();
        const ip = serverIpInput.value.trim();
        if (name && ip) {
            servers.push({ id: Date.now(), name, ip, status: 'disconnected' });
            serverNameInput.value = '';
            serverIpInput.value = '';
            renderServerList();
        }
    });

    serverListDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('connect-btn')) {
            const serverId = Number(e.target.dataset.id);
            const server = servers.find(s => s.id === serverId);
            if (server) {
                server.status = 'connecting';
                renderServerList();
                setTimeout(() => {
                    server.status = 'connected';
                    renderServerList();
                }, 2000);
            }
        }
    });

    // =================================================================
    // --- FEATURE: SCRIPT GENERATION & COPY (Unchanged) ---
    // =================================================================

    const generateScript = async () => {
        const userPrompt = promptInput.value;
        if (!userPrompt.trim()) { /* ... existing code ... */ return; }
        scriptOutput.textContent = 'Generating script...';
        generateBtn.disabled = true;
        copyBtn.classList.add('hidden');
        timestampContainer.classList.add('hidden');
        try {
            const apiUrl = '/.netlify/functions/api-proxy';
            const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ userPrompt: userPrompt }) });
            if (!response.ok) { throw new Error(`Proxy Error: ${response.statusText}`); }
            const data = await response.json();
            const generatedScript = data.choices[0].message.content;
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

    // =================================================================
    // --- FEATURE: MOCK DEPLOYMENT (Corrected) ---
    // =================================================================

    const simulateDeployment = async () => {
        deployBtn.disabled = true;
        logOutput.textContent = '';

        // BUG FIX (Scenario 4): This line was moved from the top of the file to inside here.
        // This ensures we always get the LATEST list of checkboxes from the page.
        const selectedServerCheckboxes = document.querySelectorAll('#server-list input[type="checkbox"]:checked');

        const selectedServers = Array.from(selectedServerCheckboxes).map(checkbox => {
            const serverId = Number(checkbox.dataset.id);
            return servers.find(s => s.id === serverId);
        });

        if (selectedServers.length === 0) {
            logOutput.textContent = 'Error: No connected servers selected for deployment.';
            deployBtn.disabled = false;
            return;
        }

        logOutput.textContent = 'Initializing deployment...\n';
        try {
            for (const server of selectedServers) {
                logOutput.textContent += `\nDeploying to ${server.name} (${server.ip})...`;
                await new Promise(resolve => setTimeout(resolve, 1500));
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

    // --- INITIAL RENDER ---
    // Call these functions once to set the correct initial state of the page.
    renderServerList();
    logOutput.textContent = 'Deployment logs will appear here.'; // BUG FIX (Scenario 1)
});