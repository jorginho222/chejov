import { OpenAI } from 'openai';
import { z } from 'zod';

type Tool = {
  name: string;
  description: string;
  parameters: z.ZodSchema<any>;
  execute: (args: any) => Promise<string>;
};

class Agent {
  private tools: Record<string, Tool> = {};
  private maxSteps: number;
  private client: OpenAI;

  constructor(maxSteps: number = 2) {
    this.maxSteps = maxSteps;
    this.client = new OpenAI({
      baseURL: 'http://localhost:11434/v1',
      apiKey: 'ollama', // Required but not used with Ollama
    });
  }

  addTool(tool: Tool) {
    this.tools[tool.name] = tool;
  }

  private async callTool(name: string, args: any): Promise<string> {
    const tool = this.tools[name];
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return await tool.execute(args);
  }

  private getToolDescriptions(): string {
    return Object.values(this.tools)
      .map(
        (tool) =>
          `${tool.name}: ${tool.description}\n` +
          `Parameters: ${JSON.stringify(tool.parameters._def.schema || {})}`,
      )
      .join('\n\n');
  }

  async run(prompt: string): Promise<string> {
    let messages = [
      {
        role: 'system' as const,
        content: `You are a helpful assistant with access to tools. You can use tools to help answer questions.
        Available tools:\n${this.getToolDescriptions()}
        
        You can use a tool by responding with a JSON object like this:
        {
          "tool": "tool_name",
          "args": {"arg1": "value1"}
        }
        
        Remember you can only take a maximum of ${this.maxSteps} steps.`,
      },
      { role: 'user' as const, content: prompt },
    ];

    let step = 0;
    let finalResponse = '';

    while (step < this.maxSteps) {
      step++;
      console.log(`\n--- Step ${step} of ${this.maxSteps} ---`);

      // Get the model's response
      const response = await this.client.chat.completions.create({
        model: 'llama3',
        messages: messages.slice(-20) as any, // Limit message history to last 20 messages
        max_tokens: 500, // Reduced max tokens to be more efficient
      });

      const content = response.choices[0]?.message?.content || '';
      console.log('AI:', content);

      // Try to parse as a tool call
      try {
        const parsed = JSON.parse(content);
        if (parsed.tool && this.tools[parsed.tool]) {
          console.log(`\nCalling tool: ${parsed.tool} with args:`, parsed.args);
          const toolResult = await this.callTool(parsed.tool, parsed.args);
          console.log('Tool result:', toolResult);

          // Add the tool result to the conversation
          messages.push(
            { role: 'assistant' as const, content },
            { role: 'user' as const, content: `Tool result: ${toolResult}` },
          );
        } else {
          // Only break if we have a non-empty response
          if (content.trim()) {
            finalResponse = content;
            break;
          }
        }
      } catch (e) {
        // If not a tool call or invalid JSON, treat as final response
        if (content.trim()) {
          finalResponse = content;
          break;
        }
      }

      // If we've reached max steps or no new content is being generated, break
      if (step >= this.maxSteps || content.trim() === '') {
        break;
      }
    }

    return finalResponse || 'No response generated';
  }
}

// Example usage
async function main() {
  // Create an agent with max 2 steps
  const agent = new Agent(2);

  // Add some tools
  agent.addTool({
    name: 'get_weather',
    description: 'Get the current weather in a city',
    parameters: z.object({
      city: z.string().describe('The city to get the weather for'),
    }),
    execute: async ({ city }) => {
      // In a real app, this would call a weather API
      return `The current weather in ${city} is 25°C and sunny.`;
    },
  });

  agent.addTool({
    name: 'search_web',
    description: 'Search the web for information',
    parameters: z.object({
      query: z.string().describe('The search query'),
    }),
    execute: async ({ query }) => {
      // In a real app, this would call a search API
      return `Search results for "${query}": This is a mock response.`;
    },
  });

  // Run the agent with a prompt
  const prompt =
    'What is the weather in Buenos Aires and then search for the latest news about AI?';
  console.log('\nUser:', prompt);

  const response = await agent.run(prompt);
  console.log('\nFinal response:', response);
}

main().catch(console.error);
