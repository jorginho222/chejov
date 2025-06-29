import { OpenAI } from 'openai';
import { z } from 'zod';

export enum Sentiment {
  Positive = 'positive',
  Negative = 'negative',
  Neutral = 'neutral',
}

const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // API key is required but not used with Ollama
});

const sentimentSchema = z.object({
  sentiment: z.nativeEnum(Sentiment),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score between 0 and 1'),
});

type SentimentAnalysis = z.infer<typeof sentimentSchema>;

export async function analyzeSentiment(
  text: string,
): Promise<SentimentAnalysis> {
  try {
    const response = await client.chat.completions.create({
      model: 'llama3',
      messages: [
        {
          role: 'system',
          content: `You are an AI that analyzes sentiment in text. 
          Classify the sentiment as positive, negative, or neutral.
          Respond with a JSON object containing 'sentiment' and 'confidence' (0-1).`,
        },
        {
          role: 'user',
          content: `Analyze the sentiment of the following text and respond with a JSON object containing 'sentiment' (positive, negative, or neutral) and 'confidence' (a number between 0 and 1):\n\n"${text}"`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Lower temperature for more consistent results
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const parsed = JSON.parse(content);
    const result = sentimentSchema.safeParse(parsed);

    if (!result.success) {
      console.error('Validation error:', result.error);
      throw new Error('Invalid response format from AI');
    }

    return result.data;
  } catch (error) {
    console.error('Error in analyzeSentiment:', error);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    const text =
      'The crash really broke my heart as a diehard Mclaren fan because I know how capable these guys are. It was frustrating to watch for sure, but seeing Lando take swift responsibility and handle it with humility was really great to see. I have a lot of respect for the guy’s character even if I like Oscar more, and this isn’t the first time this kind of crash has happened either. Drivers are human too, and I’m glad to see everyone safe more than anything else';
    const analysis = await analyzeSentiment(text);
    console.log('Text:', text);
    console.log('Analysis:', analysis);
    console.log(
      `Sentiment: ${analysis.sentiment} (${(analysis.confidence * 100).toFixed(1)}% confidence)`,
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
