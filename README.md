# AI Poker Arena 🃏🤖

**Practice your poker skills against AI-powered opponents.**

[Live Demo](https://splendorous-mermaid-420f56.netlify.app)

AI Poker Arena is a hands-on poker training tool. Sit at a Texas Hold'em table against AI opponents, make real decisions, and improve your reads, bet sizing, and bluff detection. The AI agents are powered by large language models — they analyze hand strength, calculate pot odds, adapt to your play style, and trash talk you while doing it. Switch to Transparent Mode at any time to peek inside the AI's reasoning and study exactly why it made each decision.

---

## Features ✨

### Play as Yourself 👤

Take a seat at the table alongside AI agents. You make every decision — fold, check, call, raise, or go all-in — using real poker logic against opponents that adapt, bluff, and trash talk. Your hole cards are always visible to you, and all standard Texas Hold'em rules are enforced: only legal actions are presented, bet sizing is validated, and pot/side-pot calculations are handled automatically.

### Watch AI Agents Play Each Other 🍿

You don't have to play to learn. Set up a table of AI agents and sit back while they play full hands against each other. Use this mode to study AI decision-making, observe bluffing patterns, compare different model strategies, or simply enjoy the chaos.

Use the playback controls to let the game run on autopilot, or step through one turn at a time to examine each decision closely. In Transparent Mode, every hole card is visible and every agent's internal reasoning is accessible, giving you a front-row seat to how LLMs think through poker decisions under pressure. This is especially useful for spotting exploitable tendencies in AI opponents before you sit down to play against them.



### Bring Your Own Agents (BYOK) 🔑

Register custom AI agents using any OpenAI-compatible chat completions API. Each agent is configured with:

- **API Endpoint** — Supports OpenAI (`api.openai.com`), xAI (`api.x.ai`), or any provider that implements the OpenAI chat completions format.
- **API Key** — Stored exclusively in your browser's localStorage. Never sent to our servers, never logged, never shared.
- **Model Selection** — Choose from GPT-4o, GPT-4o-mini, Grok, or any model your provider supports.
- **Custom Base Prompt** — Define each agent's personality and strategy. For example: *"You play extremely tight and only enter pots with premium hands"* or *"You are a loose-aggressive maniac who 3-bets everything."* This prompt is prepended to the system instructions on every turn.
- **Profile Image** — Give each agent a visual identity at the table.

The app ships with preconfigured agent templates (AssGPT, AdamGrok, BillyGrok) that you can use immediately by adding your API key.

### Transparent and Player View Modes 👁️

Two viewing modes let you control how much information is visible during gameplay:

- **Player Mode** (default) — Simulates a real poker experience. Opponent hole cards are hidden until showdown. AI reasoning and internal thoughts are completely hidden from the Table Talk sidebar. This is the mode you should use when practicing.
- **Transparent Mode** — Reveals all hole cards for every player, and unlocks the AI's internal reasoning in the Table Talk sidebar. Each chat message gains a "Reveal Internal Thought" expandable showing the model's full strategic analysis — hand strength evaluation, pot odds calculations, opponent reads, and decision rationale. This mode is designed for studying how the AI thinks.

### Full Texas Hold'em Engine ♠️♥️♣️♦️

The game engine implements complete Texas Hold'em poker rules:

- **Betting rounds**: Preflop, Flop, Turn, River, and Showdown
- **Blind structure**: Automatic small blind and big blind posting with rotating dealer button
- **Action validation**: Only legal actions are presented to each player based on the current game state
- **All-in handling**: Full side pot calculation when players go all-in with different stack sizes
- **Hand evaluation**: Automatic hand ranking and winner determination at showdown
- **Position tracking**: Dealer, Small Blind, Big Blind, Early, Middle, and Late positions are calculated and communicated to each AI agent

### Table Talk 💬

AI agents generate natural-language commentary during play. Each agent speaks in character based on their custom prompt — some trash talk, some stay analytical, some bluff verbally. Messages appear in the Table Talk sidebar alongside the game action.

In Transparent Mode, each chat message can be expanded to reveal the agent's private internal thought process — what they were actually thinking when they said something. This lets you spot deceptive table talk (e.g., an agent claiming to have a strong hand while their internal thought reveals they're bluffing).

### Voice Over (Text-to-Speech) 🔊

AI agents speak their table talk aloud using the browser's Web Speech API. Each agent is assigned a distinct voice, and different speech presets (confident, nervous, aggressive, friendly) adjust the rate, pitch, and volume to match the tone of the message.

Voice over can be toggled on and off during gameplay using the Voice button in the control bar.

### PK Mode 🥊

PK Mode activates during heads-up play (when only 2 players remain). When enabled, the AI's internal reasoning is spoken aloud via TTS *before* their table talk. This creates a commentator-like experience where you hear the model's full thought process — hand analysis, opponent reads, and strategic calculations — followed by whatever they chose to say at the table.

PK Mode is only active during heads-up to keep the experience focused. It requires voice over to be enabled.

### Playback Controls ⏯️

When not playing as yourself, you can control how the AI game progresses:

- **Auto-play** — AI agents play autonomously at a configurable speed. The game advances automatically through each turn.
- **Step-through** — Advance one turn at a time to study each individual decision in detail.
- **Pause/Resume** — Pause auto-play at any point to examine the current game state.

When it is your turn (if you're playing as yourself), auto-play automatically pauses and presents your action options.

### AI Agent Architecture 🧠

Each AI agent makes decisions through a tool-calling interface. On every turn, the agent receives the full game state — their hole cards, community cards, pot size, position, opponent chip counts, valid actions, and the complete hand history from previous rounds. The agent responds with up to three simultaneous tool calls:

1. **Think** — Records internal reasoning (hand strength analysis, pot odds, opponent tendencies)
2. **Say** — Generates table talk (trash talk, bluffs, reactions)
3. **Action** — Executes a poker action (fold, check, call, raise, all-in)

All three are requested in a single API call to minimize latency. The hand history from previous rounds is preserved and sent to each agent, allowing them to identify opponent patterns, track bluff frequencies, and adapt their strategy over multiple hands.

---

## Recommended Models 🚀

For the best experience, use fast inference models that keep the game flowing at a natural pace. Slower reasoning models will introduce noticeable delays between turns.

| Model | Provider | API Endpoint | Notes |
|:---|:---|:---|:---|
| **grok-4-1-fast** (recommended) | xAI | `https://api.x.ai/v1/chat/completions` | Non-reasoning fast mode with 2M token context. Excellent speed-to-quality ratio. |
| **gpt-5-nano** | OpenAI | `https://api.openai.com/v1/chat/completions` | Fastest OpenAI model. Optimized for rapid, targeted tasks. |
| **gpt-5-mini** | OpenAI | `https://api.openai.com/v1/chat/completions` | Balanced speed and capability. Good default choice for OpenAI users. |
| **gemini-3-flash** | Google | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | Ultra-low latency. Requires a Google AI Studio API key. |
| **claude-5-haiku** | Anthropic | Requires an OpenAI-compatible proxy (e.g., LiteLLM, OpenRouter) | Ultra-fast inference. Not natively OpenAI-compatible; use a proxy. |

Any provider that implements the OpenAI chat completions format will work. When registering an agent, set the API URL to your provider's chat completions endpoint and enter the model name.

---

## Setup ⚙️

### Prerequisites

- Node.js 18 or later
- npm
- An API key for at least one of the providers listed above

### Install and Run

```bash
git clone https://github.com/keanthon/poker_agent.git
cd poker_agent
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting Started

1. Click **Start Playing** on the home page
2. The app comes with preconfigured agent templates — click **Edit** on any agent and paste your API key
3. Select 2 or more agents and click **Quick Start Game**
4. Optionally click **Play as Yourself** to take a seat at the table

---

## Security and Privacy 🛡️

This application uses a strict Bring Your Own Key (BYOK) model:

1. API keys are entered directly in the browser and stored only in localStorage
2. LLM requests are proxied through a stateless Next.js Edge Route solely to bypass browser CORS restrictions
3. API keys are never logged, persisted server-side, or transmitted to any third party

The proxy acts exclusively as a pass-through and retains zero state between requests.
