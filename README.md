# Foobar: AI-Powered Sysadmin Scripting

An agentic coding tool that takes you from natural language to remote server deployment in seconds. "Foobar" is a web-based SaaS tool designed for sysadmins and IT Ops to generate and deploy automation scripts using AI.

### [View the Live Demo](https://mvp-foobar-nk.netlify.app/)

---

### ⚠️ About This MVP
This project is a functional **Minimum Viable Product (MVP)** built for demonstration purposes. The entire backend workflow—from server connections to the final script execution—is **simulated**. The goal is to showcase a robust and professional user experience and the core application flow without requiring real server infrastructure.

---

![Foobar Demo](assets/Foobar-MVP-GIF.gif)

### The Problem
> "As a sysadmin, I want to use an agentic coding tool that can generate a bash script for my use case—'to take backup of system config on a Linux machine'—and then deploy this script on a remote linux server for execution."

Current agentic tools often stop at local code generation. "Foobar" aims to solve the full end-to-end workflow, from prompt to deployment.

## ✨ Key Features

This MVP demonstrates the core user journey with a focus on a professional and safe user experience.

*   **AI Script Generation:** Leverages a free AI model via OpenRouter to generate bash scripts from natural language prompts.
*   **Secure Backend Proxy:** All API requests are routed through a serverless function on Netlify, ensuring your API key is never exposed on the frontend.
*   **Dynamic UI:** Features a smoothly transitioning header and a clean, modern interface.
*   **Interactive Script Editor:**
    *   **Syntax Highlighting:** Uses Prism.js for excellent readability.
    *   **Edit & Save Flow:** A dedicated edit mode with a smooth, auto-resizing textarea to prevent cursor jumping.
    *   **Smart Versioning:** An `(editing v1)`, `(saved v1)` tag system tracks changes and encourages safe practices.
*   **Mock Server Management:**
    *   **Input Validation:** Ensures server names are not empty and IP addresses have a valid format.
    *   **State Preservation:** User selections (checked boxes) are preserved even when the list is updated.
*   **Safe Deployment Workflow:**
    *   **Dry Run:** A dedicated "Dry Run" button provides a safe simulation of what the script will do before any real action is taken.
    *   **Deployment Warning:** A clear, irreversible action warning appears only after a successful dry run, making the final deployment a deliberate and confident choice.

## 🚀 How It Works: The User Journey

1.  **Describe:** Enter a task in plain English (e.g., "Delete files in temporary folder /tmp").
2.  **Generate:** The AI generates a bash script.
3.  **Edit & Save:** Click "Edit" to enter a smooth editing mode. Click "Save" to save your changes and update the version tag.
4.  **Manage Servers:** Add mock servers with name and IP validation.
5.  **Connect:** "Connect" to the servers to prepare them for deployment.
6.  **Dry Run:** Perform a safe, simulated dry run to review the script's intended actions.
7.  **Deploy:** After seeing the warning, click "Deploy" to run the mock deployment.

## 💡 Limitations & Future Work

*   **Script Accuracy:** The free `openrouter/cypher-alpha` model is used for cost-effective demonstration. For production use, the accuracy and complexity of generated scripts could be dramatically improved by integrating a more powerful model like GPT-4 or Claude 3.
*   **Real Deployment:** The next major step is to replace the mock backend with a real one that uses SSH key management (e.g., with a library like `node-ssh`) to execute scripts on actual remote servers.
*   **Script Library:** A crucial feature for real-world use would be a script library, allowing users to save, name, and reuse their most common automations and templates.

## 🛠️ Tech Stack

*   **Frontend:** Vanilla HTML, CSS, JavaScript
*   **AI Model:** `openrouter/cypher-alpha:free`
*   **Backend & Hosting:** Netlify (Static Site + Serverless Functions)
*   **Syntax Highlighting:** Prism.js
*   **Dependencies:** `node-fetch` (for the serverless function)

## Getting Started Locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nk7608/mvp-foobar.git
    cd mvp-foobar
    ```

2.  **Install dependencies:**
    This installs the `node-fetch` package required for the serverless function.
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of the project and add your OpenRouter API key. *(This file is included in `.gitignore` and will not be committed.)*
    ```bash
    OPENROUTER_API_KEY=your_key_here
    ```

4.  **Run the local development server:**
    The Netlify CLI will run your site and serverless function together.
    ```bash
    netlify dev
    ```
