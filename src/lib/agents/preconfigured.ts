// Preconfigured agents - API keys loaded from environment variables

export interface PreconfiguredAgent {
  name: string;   // Display name
  apiUrl: string;
  apiKey: string;
  profileImage: string;
  model: string;  // Model name
}

// Load from environment variables (set in .env.local)
export const PRECONFIGURED_AGENTS: PreconfiguredAgent[] = [
  {
    name: 'AssGPT',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    profileImage: '/chatgpt.png',
    model: 'gpt-5-nano',
  },
  {
    name: 'AdamGrok',
    apiUrl: 'https://api.x.ai/v1/chat/completions',
    apiKey: process.env.NEXT_PUBLIC_XAI_API_KEY || '',
    profileImage: '/grok.png',
    model: 'grok-4-1-fast-reasoning',
  },
  {
    name: 'BillyGrok',
    apiUrl: 'https://api.x.ai/v1/chat/completions',
    apiKey: process.env.NEXT_PUBLIC_XAI_API_KEY || '',
    profileImage: '/grok.png',
    model: 'grok-4-1-fast-reasoning',
  },
];
