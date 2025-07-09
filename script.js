document.addEventListener("DOMContentLoaded", () => {
  let servers = [];
  let scriptVersion = 0;

  const mainHeading = document.getElementById("main-heading");
  const generateBtn = document.getElementById("generate-btn");
  const promptInput = document.getElementById("prompt-input");
  const scriptOutput = document.getElementById("script-output");
  const codeElement = document.querySelector("#script-output code");
  const scriptEditor = document.getElementById("script-editor");
  const copyBtn = document.getElementById("copy-btn");
  const editBtn = document.getElementById("edit-btn");
  const saveBtn = document.getElementById("save-btn");
  const timestampContainer = document.getElementById("timestamp-container");
  const timestampOutput = document.getElementById("timestamp-output");
  const editedTag = document.getElementById("edited-tag");
  const addServerBtn = document.getElementById("add-server-btn");
  const serverNameInput = document.getElementById("server-name-input");
  const serverIpInput = document.getElementById("server-ip-input");
  const serverListDiv = document.getElementById("server-list");
  const deployBtn = document.getElementById("deploy-btn");
  const logOutput = document.getElementById("log-output");
  const dryRunBtn = document.getElementById("dry-run-btn");
  const deployWarning = document.getElementById("deploy-warning");

  const greetings = [
    "Foobar: AI Script Generator",
    "Hello, Sysadmin! Ready to automate?",
    "What can I script for you today?",
    "Foobar: Your agentic coding tool.",
    "Generate, deploy, and relax.",
  ];
  let greetingIndex = 0;
  setInterval(() => {
    mainHeading.style.opacity = 0;
    setTimeout(() => {
      greetingIndex = (greetingIndex + 1) % greetings.length;
      mainHeading.textContent = greetings[greetingIndex];
      mainHeading.style.opacity = 1;
    }, 500);
  }, 5000);

  const autoResizeTextarea = (element) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  editBtn.addEventListener("click", () => {
    scriptEditor.value = codeElement.textContent;
    scriptOutput.classList.add("hidden");
    scriptEditor.classList.remove("hidden");
    editBtn.classList.add("hidden");
    copyBtn.classList.add("hidden");
    saveBtn.classList.remove("hidden");
    editedTag.textContent = ` (editing v${scriptVersion})`;
    editedTag.classList.remove("hidden", "status-saved");
    editedTag.classList.add("status-editing");
    deployWarning.classList.add("hidden");
    scriptEditor.focus();
    autoResizeTextarea(scriptEditor);
  });

  saveBtn.addEventListener("click", () => {
    codeElement.textContent = scriptEditor.value;
    Prism.highlightElement(codeElement);
    scriptEditor.classList.add("hidden");
    scriptOutput.classList.remove("hidden");
    saveBtn.classList.add("hidden");
    editBtn.classList.remove("hidden");
    copyBtn.classList.remove("hidden");
    timestampOutput.textContent = new Date().toLocaleString();
    editedTag.textContent = ` (saved v${scriptVersion})`;
    editedTag.classList.remove("status-editing");
    editedTag.classList.add("status-saved");
    deployWarning.classList.add("hidden");
    scriptVersion++;
  });

  scriptEditor.addEventListener("input", () =>
    autoResizeTextarea(scriptEditor)
  );

  const generateScript = async () => {
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
      codeElement.textContent = "Please enter a task description first.";
      return;
    }
    codeElement.textContent = "Generating script...";
    codeElement.parentElement.classList.remove("language-bash");
    generateBtn.disabled = true;
    copyBtn.classList.add("hidden");
    editBtn.classList.add("hidden");
    saveBtn.classList.add("hidden");
    editedTag.classList.add("hidden");
    scriptEditor.classList.add("hidden");
    scriptOutput.classList.remove("hidden");
    deployWarning.classList.add("hidden");
    try {
      const apiUrl = "/.netlify/functions/api-proxy";
      const response = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({ userPrompt: userPrompt }),
      });
      if (!response.ok) {
        throw new Error(`Proxy Error: ${response.statusText}`);
      }
      const data = await response.json();
      const generatedScript = data.choices[0].message.content;
      codeElement.parentElement.classList.add("language-bash");
      codeElement.textContent = generatedScript;
      Prism.highlightElement(codeElement);
      timestampOutput.textContent = new Date().toLocaleString();
      timestampContainer.classList.remove("hidden");
      copyBtn.classList.remove("hidden");
      editBtn.classList.remove("hidden");
      scriptVersion = 1;
    } catch (error) {
      console.error("Error:", error);
      codeElement.textContent = `An error occurred. Check console for details. \n\n${error.message}`;
    } finally {
      generateBtn.disabled = false;
    }
  };
  generateBtn.addEventListener("click", generateScript);

  copyBtn.addEventListener("click", () => {
    const textToCopy = codeElement.textContent;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        copyBtn.textContent = "Error";
      });
  });

  const renderServerList = () => {
    serverListDiv.innerHTML = "";
    if (servers.length === 0) {
      serverListDiv.innerHTML = "<p>No servers added yet.</p>";
      return;
    }
    servers.forEach((server) => {
      const isConnected = server.status === "connected";
      const serverElement = document.createElement("div");
      serverElement.className = "server-item";
      serverElement.innerHTML = `
                <input type="checkbox" id="server-check-${
                  server.id
                }" data-id="${server.id}" ${isConnected ? "" : "disabled"} ${
        server.isSelected ? "checked" : ""
      }>
                <div class="server-info">
                    <div class="server-name">${server.name}</div>
                    <div class="server-ip">${server.ip}</div>
                </div>
                <div class="status-indicator">
                    <div class="status-dot status-${server.status}"></div>
                    <span>${
                      server.status.charAt(0).toUpperCase() +
                      server.status.slice(1)
                    }</span>
                </div>
                <button class="connect-btn" data-id="${server.id}" ${
        server.status !== "disconnected" ? "disabled" : ""
      }>
                    ${
                      server.status === "connected"
                        ? "Connected"
                        : server.status === "connecting"
                        ? "Connecting..."
                        : "Connect"
                    }
                </button>
            `;
      serverListDiv.appendChild(serverElement);
    });
  };

  addServerBtn.addEventListener("click", () => {
    const name = serverNameInput.value.trim();
    const ip = serverIpInput.value.trim();
    if (!name || !ip) {
      alert("Server name and IP address cannot be empty.");
      return;
    }
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) {
      alert("Please enter a valid IP address format (e.g., 192.168.1.1).");
      return;
    }
    servers.push({
      id: Date.now(),
      name,
      ip,
      status: "disconnected",
      isSelected: false,
    });
    serverNameInput.value = "";
    serverIpInput.value = "";
    renderServerList();
  });

  serverListDiv.addEventListener("click", (e) => {
    const target = e.target;
    const serverId = Number(target.dataset.id);
    if (target.classList.contains("connect-btn")) {
      const server = servers.find((s) => s.id === serverId);
      if (server && server.status === "disconnected") {
        server.status = "connecting";
        renderServerList();
        setTimeout(() => {
          server.status = "connected";
          renderServerList();
        }, 2000);
      }
    }
    if (target.type === "checkbox") {
      const server = servers.find((s) => s.id === serverId);
      if (server) {
        server.isSelected = target.checked;
      }
    }
  });

  const getSelectedServers = () => {
    return servers.filter((server) => server.isSelected);
  };

  const simulateDryRun = async () => {
    dryRunBtn.disabled = true;
    deployBtn.disabled = true;
    logOutput.textContent = "";
    deployWarning.classList.add("hidden");
    const selectedServers = getSelectedServers();
    if (selectedServers.length === 0) {
      logOutput.textContent =
        "Error: No connected servers selected for dry run.";
      dryRunBtn.disabled = false;
      deployBtn.disabled = false;
      return;
    }
    logOutput.textContent = "Performing dry run...\n";
    try {
      for (const server of selectedServers) {
        logOutput.textContent += `\n[DRY RUN] Connecting to ${server.name} (${server.ip})...`;
        await new Promise((resolve) => setTimeout(resolve, 500));
        logOutput.textContent += `\n[DRY RUN] Would execute the following script:\n------------------------------------\n${codeElement.textContent}\n------------------------------------\n`;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        logOutput.textContent += `[DRY RUN] ✅ Simulation successful on ${server.name}.`;
      }
      logOutput.textContent += `\n\nDry run complete. Please review the actions above.`;
      deployWarning.classList.remove("hidden");
    } catch (error) {
      logOutput.textContent += "\n❌ A dry run error occurred.";
    } finally {
      dryRunBtn.disabled = false;
      deployBtn.disabled = false;
    }
  };
  dryRunBtn.addEventListener("click", simulateDryRun);

  const simulateDeployment = async () => {
    deployBtn.disabled = true;
    dryRunBtn.disabled = true;
    logOutput.textContent = "";
    deployWarning.classList.add("hidden");
    const selectedServers = getSelectedServers();
    if (selectedServers.length === 0) {
      logOutput.textContent =
        "Error: No connected servers selected for deployment.";
      deployBtn.disabled = false;
      dryRunBtn.disabled = false;
      return;
    }
    logOutput.textContent = "Initializing REAL deployment...\n";
    try {
      for (const server of selectedServers) {
        logOutput.textContent += `\n🚀 Deploying to ${server.name} (${server.ip})...`;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        logOutput.textContent += ` ✅ Done.`;
      }
      logOutput.textContent += `\n\nDeployment complete.`;
    } catch (error) {
      logOutput.textContent += "\n❌ A deployment error occurred.";
    } finally {
      deployBtn.disabled = false;
      dryRunBtn.disabled = false;
    }
  };
  deployBtn.addEventListener("click", simulateDeployment);

  renderServerList();
  logOutput.textContent = "Deployment logs will appear here.";
});
