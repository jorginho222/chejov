import { z } from 'zod';
import { OpenAI } from 'openai';

type Player = {
  name: string;
  lastName: string;
  position: number;
};

const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // API key is required but not used with Ollama
});

const rankingSchema = z.object({
  topFive: z.array(
    z.object({
      name: z.string().describe('The name of the player'),
      lastName: z.string().describe('The last name of the player'),
      position: z
        .number()
        .describe('The position number in international ranking'),
    }),
  ),
});

export const createRanking = async (prompt: string): Promise<Player[]> => {
  try {
    const response = await client.chat.completions.create({
      model: 'llama3',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that ranks the top 5 tennis players based on current international ranking.
          Respond with a JSON object containing an array called 'topFive' with the players' information.
          Each player should have: name, lastName, and position (1-5).`,
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const parsed = JSON.parse(content);
    const result = rankingSchema.safeParse(parsed);

    if (!result.success) {
      console.error('Validation error:', result.error);
      throw new Error('Invalid response format from AI');
    }

    return result.data.topFive;
  } catch (error) {
    console.error('Error in createRanking:', error);
    throw error;
  }
};

// Wrap in an async IIFE to use await at the top level
(async () => {
  try {
    const ranking = await createRanking('Who are the best 5 tennis players?');
    console.log('Top 5 Tennis Players:', JSON.stringify(ranking, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
})();
