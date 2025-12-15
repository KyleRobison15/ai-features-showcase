import OpenAI from 'openai';
import { InferenceClient } from '@huggingface/inference';
import summarizePrompt from '../llm/prompts/summarize-reviews.txt';

const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const inferenceClient = new InferenceClient(process.env.HF_TOKEN);

type GenerateTextOptions = {
  model?: string;
  instructions?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  previousResponseId?: string;
};

type GenerateTextResult = {
  id: string;
  text: string;
};

export const llmClient = {
  async generateText({
    model = 'gpt-4o-mini',
    instructions,
    prompt,
    temperature = 0.2,
    maxTokens = 300,
    previousResponseId,
  }: GenerateTextOptions): Promise<GenerateTextResult> {
    const response = await openAIClient.responses.create({
      model,
      instructions,
      input: prompt,
      temperature,
      max_output_tokens: maxTokens,
      previous_response_id: previousResponseId,
    });

    return {
      id: response.id,
      text: response.output_text,
    };
  },

  async summarizeReviews(reviews: string) {
    const chatCompletion = await inferenceClient.chatCompletion({
      model: 'meta-llama/Llama-3.1-8B-Instruct:novita',
      messages: [
        {
          role: 'system',
          content: summarizePrompt,
        },
        {
          role: 'user',
          content: reviews,
        },
      ],
    });

    return chatCompletion.choices[0]?.message.content || '';
  },
};
