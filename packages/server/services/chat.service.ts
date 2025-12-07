import OpenAI from 'openai';
import { conversationRepository } from '../repositories/conversation.repository';

// The "Single Responsibility" of a SERVICE -> Handle Application Logic

// Create a new instance of OpenAI with our API Key
// This is IMPLEMENTATION DETAIL (Here we are using the OpenAI LLM)
const client = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

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
         input: prompt,
         temperature: 0.2,
         max_output_tokens: 100,
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
