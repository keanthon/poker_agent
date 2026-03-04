import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { apiUrl, apiKey, payload } = await req.json();

    if (!apiUrl || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing apiUrl or apiKey' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward the request to the target API (OpenAI, xAI, etc.)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error from ${apiUrl}:`, response.status, errorText);
        return new Response(errorText, {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const data = await response.json();

    // Return the successful response back to the client
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
