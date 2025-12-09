import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { conversationRepository } from '../repositories/conversation.repository';
import template from '../prompts/chatbot.txt';

// The "Single Responsibility" of a SERVICE -> Handle Application Logic

// Create a new instance of OpenAI with our API Key
// This is IMPLEMENTATION DETAIL (Here we are using the OpenAI LLM)
const client = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

// Syncronously (no promise) read our MD file into a variable
// Replace the placeholder in our template with the information we read in from our MD file
// We do this ONCE (when this chat service module is loaded) and then re-use the instructions for every API request.
const shopInfo = fs.readFileSync(
   path.join(__dirname, '..', 'prompts', 'MillersMountainBikes.md'),
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
      const response = await client.responses.create({
         model: 'gpt-4o-mini',
         instructions,
         input: prompt,
         temperature: 0.2,
         max_output_tokens: 200,
         previous_response_id:
            conversationRepository.getLastResponseId(conversationId),
      });

      conversationRepository.setLastResponseId(conversationId, response.id);

      // Instead of returning the OpenAI specific response, we return our platform agnostic response
      return {
         id: response.id,
         message: response.output_text,
      };
   },
};
