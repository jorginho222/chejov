import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { once } from 'node:events';
import { CoreMessage } from 'ai';
import { OpenAI } from 'openai';
import fetch from 'nodemailer/lib/fetch';

export const startServer = async () => {
  const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama', // API key is required but not used with Ollama
  });
  const app = new Hono();

  app.post('/api/get-completions', async (ctx) => {
    const coreMessages: CoreMessage[] = await ctx.req.json();

    // Convert CoreMessage[] to the format expected by OpenAI
    const openAIMessages = coreMessages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    const response = await client.chat.completions.create({
      model: 'llama3',
      messages: openAIMessages,
    });

    return ctx.json(response.choices[0]?.message?.content || '');
  });

  const server = serve({
    fetch: app.fetch,
    port: 4317,
    hostname: '0.0.0.0',
  });

  // wait for "listening" event to fire
  await once(server, 'listening');

  return server;
};

const messagesToSend: CoreMessage[] = [
  {
    role: 'user',
    content: 'Which color is the white horse of Saint Martin',
  },
];

(async () => {
  const server = await startServer();
})().catch(console.error);

(async () => {
  try {
    const response = await fetch('http://localhost:4317/api/get-completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagesToSend),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    const newMessage: CoreMessage = {
      role: 'assistant',
      content: responseText,
    };

    const allMessages = [...messagesToSend, newMessage];
    console.dir(allMessages, { depth: null });
  } catch (error) {
    console.error('Error:', error);
  }
})();
