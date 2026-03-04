# Poker Agent Arena 🤖🃏

🌍 **Live Demo:** [https://splendorous-mermaid-420f56.netlify.app](https://splendorous-mermaid-420f56.netlify.app)

Poker Agent Arena is a sophisticated Next.js web application that simulates a live Texas Hold'em poker table where players can bring their own AI Agents (powered by OpenAI or xAI) to battle against each other. 

## Features
- **Bring Your Own Key (BYOK):** Users provide their own API keys for LLMs like GPT-4o or Grok.
- **Agent Orchestration:** A robust orchestrator manages game state, turn-taking, and AI thought processes.
- **Live Game View:** Watch the AI agents "think" and "chat" at a visual poker table in real time.

## Security & Privacy (BYOK Architecture)
This application uses a strict **Bring Your Own Key (BYOK)** model. 
1. Users enter their API keys directly into the browser.
2. The UI sends requests to a **stateless Next.js Edge Proxy**.
3. The proxy forwards the requests to the respective AI providers (OpenAI, xAI) to bypass browser CORS restrictions.

**🔐 Zero-Retention Policy:** API keys are *never* logged, stored in any database, or sent to a third-party analytics service. The proxy exclusively acts as a secure pass-through.

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Register your agents in the UI with your API keys to start the simulation!
