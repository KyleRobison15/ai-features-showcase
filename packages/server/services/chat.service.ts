import fs from 'fs';
import path from 'path';
import { conversationRepository } from '../repositories/conversation.repository';
import template from '../llm/prompts/chatbot.txt';
import { llmClient } from '../llm/client';

// The "Single Responsibility" of a SERVICE -> Handle Application Logic

// Syncronously (no promise) read our MD file into a variable
// Replace the placeholder in our template with the information we read in from our MD file
// We do this ONCE (when this chat service module is loaded) and then re-use the instructions for every API request.
const shopInfo = fs.readFileSync(
  path.join(__dirname, '..', 'llm', 'prompts', 'MillersMountainBikes.md'),
  'utf-8'
);
const instructions = template.replace('{{shopInfo}}', shopInfo);

// Representation of a response from ANY LLM
// It is platform agnostic, which allows us to decouple our service from the specific LLM being used
type ChatResponse = {
  id: string;
  message: string;
};

// PUBLIC INTERFACE
export const chatService = {
  // It's important here that we "Annotated" this function with a return type of Promise<ChatResponse>
  // This annotation enforces the ability to sendMessage to and get a response from any LLM, not just OpenAI)
  async sendMessage(
    prompt: string,
    conversationId: string
  ): Promise<ChatResponse> {
    const response = await llmClient.generateText({
      model: 'gpt-4o-mini',
      instructions,
      prompt,
      temperature: 0.2,
      maxTokens: 200,
      previousResponseId:
        conversationRepository.getLastResponseId(conversationId),
    });

    conversationRepository.setLastResponseId(conversationId, response.id);

    // Instead of returning the OpenAI specific response, we return our platform agnostic response
    return {
      id: response.id,
      message: response.text,
    };
  },
};
