import { OpenAI } from 'openai';

// Initialize the client
const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // Required but not used with Ollama
});

// Function to process the model's response
const processResponse = (response: string) => {
  try {
    // Try to parse the response as JSON
    const parsed = JSON.parse(response);
    if (parsed.log) {
      console.log(`[LOG] ${parsed.log}`);
    } else {
      console.log('No log message found in response');
    }
  } catch (e) {
    // If not JSON, just log the raw response
    console.log('Response:', response);
  }
};

// Function to chat with the model
const chatWithModel = async (prompt: string) => {
  try {
    // First, get the model's response
    const response = await client.chat.completions.create({
      model: 'llama3', // Try with llama3
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that can log messages to the console. 
          When asked to log something, respond with a JSON object containing a "log" field with the message to log.
          Example: {"log": "Your message here"}`,
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    // Process the response
    const content = response.choices[0]?.message?.content;
    if (content) {
      processResponse(content);
    } else {
      console.log('No content in response');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the example
(async () => {
  await chatWithModel('Please log this message: Hello, world!');
})();
