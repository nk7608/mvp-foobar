document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    let servers = [];
    let scriptVersion = 0;

    // --- DOM ELEMENT SELECTION ---
    const mainHeading = document.getElementById('main-heading');
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const scriptOutput = document.getElementById('script-output');
    const codeElement = document.querySelector('#script-output code');
    const scriptEditor = document.getElementById('script-editor');
    const copyBtn = document.getElementById('copy-btn');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const timestampContainer = document.getElementById('timestamp-container');
    const timestampOutput = document.getElementById('timestamp-output');
    const editedTag = document.getElementById('edited-tag');
    const addServerBtn = document.getElementById('add-server-btn');
    const serverNameInput = document.getElementById('server-name-input');
    const serverIpInput = document.getElementById('server-ip-input');
    const serverListDiv = document.getElementById('server-list');
    const deployBtn = document.getElementById('deploy-btn');
    const logOutput = document.getElementById('log-output');

    // =================================================================
    // --- DYNAMIC GREETING ---
    // =================================================================
    const greetings = ["Foobar: AI Script Generator", "Hello, Sysadmin! Ready to automate?", "What can I script for you today?", "Foobar: Your agentic coding tool.", "Generate, deploy, and relax."];
    let greetingIndex = 0;
    setInterval(() => {
        mainHeading.style.opacity = 0;
        setTimeout(() => {
            greetingIndex = (greetingIndex + 1) % greetings.length;
            mainHeading.textContent = greetings[greetingIndex];
            mainHeading.style.opacity = 1;
        }, 500);
    }, 5000);

    // =================================================================
    // --- AUTO-RESIZE TEXTAREA LOGIC ---
    // =================================================================
    const autoResizeTextarea = (element) => {
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
    };

    // =================================================================
    // --- EDIT / SAVE / HIGHLIGHTING LOGIC ---
    // =================================================================

    editBtn.addEventListener('click', () => {
        scriptEditor.value = codeElement.textContent;
        scriptOutput.classList.add('hidden');
        scriptEditor.classList.remove('hidden');
        editBtn.classList.add('hidden');
        copyBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        editedTag.textContent = ` (editing v${scriptVersion})`;
        editedTag.classList.remove('hidden', 'status-saved');
        editedTag.classList.add('status-editing');
        scriptEditor.focus();
        autoResizeTextarea(scriptEditor); // Set initial size
    });

    saveBtn.addEventListener('click', () => {
        codeElement.textContent = scriptEditor.value;
        Prism.highlightElement(codeElement);
        scriptEditor.classList.add('hidden');
        scriptOutput.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        editBtn.classList.remove('hidden');
        copyBtn.classList.remove('hidden');
        timestampOutput.textContent = new Date().toLocaleString();
        editedTag.textContent = ` (saved v${scriptVersion})`;
        editedTag.classList.remove('status-editing');
        editedTag.classList.add('status-saved');
        scriptVersion++;
    });

    // THIS IS THE FIX: Re-added the event listener to resize the editor on every keystroke.
    scriptEditor.addEventListener('input', () => autoResizeTextarea(scriptEditor));

    // --- SCRIPT GENERATION ---
    const generateScript = async () => {
        const userPrompt = promptInput.value.trim();
        if (!userPrompt) { codeElement.textContent = 'Please enter a task description first.'; return; }
        
        codeElement.textContent = 'Generating script...';
        codeElement.parentElement.classList.remove("language-bash");
        generateBtn.disabled = true;
        copyBtn.classList.add('hidden');
        editBtn.classList.add('hidden');
        saveBtn.classList.add('hidden');
        editedTag.classList.add('hidden');
        scriptEditor.classList.add('hidden');
        scriptOutput.classList.remove('hidden');

        try {
            const apiUrl = '/.netlify/functions/api-proxy';
            const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ userPrompt: userPrompt }) });
            if (!response.ok) { throw new Error(`Proxy Error: ${response.statusText}`); }
            const data = await response.json();
            const generatedScript = data.choices[0].message.content;

            codeElement.parentElement.classList.add("language-bash");
            codeElement.textContent = generatedScript;
            Prism.highlightElement(codeElement);
            timestampOutput.textContent = new Date().toLocaleString();
            timestampContainer.classList.remove('hidden');
            copyBtn.classList.remove('hidden');
            editBtn.classList.remove('hidden');
            scriptVersion = 1;
        } catch (error) {
            console.error('Error:', error);
            codeElement.textContent = `An error occurred. Check console for details. \n\n${error.message}`;
        } finally {
            generateBtn.disabled = false;
        }
    };
    generateBtn.addEventListener('click', generateScript);

    // --- (The rest of the file is unchanged) ---
    copyBtn.addEventListener('click', () => {
        const textToCopy = codeElement.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            copyBtn.textContent = 'Error';
        });
    });

    const renderServerList = () => {
        serverListDiv.innerHTML = '';
        if (servers.length === 0) {
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

    const simulateDeployment = async () => {
        deployBtn.disabled = true;
        logOutput.textContent = '';
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
    
    // Initial Render
    renderServerList();
    logOutput.textContent = 'Deployment logs will appear here.';
});