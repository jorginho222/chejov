import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
});

async function streamText(prompt: string) {
  try {
    const stream = await client.chat.completions.create({
      model: 'llama3',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond concisely.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      stream: true, // Enable streaming
    });

    console.log('\nResponse:');
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(content);
    }
    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example usage
async function main() {
  const prompt = 'In Which country was invented the wine?';
  console.log(`Sending request: "${prompt}"\n`);
  await streamText(prompt);
}

main().catch(console.error);