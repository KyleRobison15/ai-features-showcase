import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// This function from the dotenv library goes into our .env file and loads each one as an environment variable for us automatically
// Without the dotenv library, we would have to create our env vars manually on the command line before running our server every single time
// Needs to be the first line in your module so the env vars are loaded before anything else happens!
dotenv.config();

// Create a new instance of OpenAI with our API Key
const client = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

// This is what we will use to build our API endpoints and handle requests and responses
const app = express();

// Tells express to automatically parse JSON objects from our request body
// Returns a middleware function that gets executed before passing the request to our request handler
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
   res.send('Hello World!');
});

app.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'Hello World!' });
});

// Maps conversationId -> lastResponseId
// e.g. conv1 -> 100, conv2 -> 3
// This allows us to keep track of multiple conversations and multiple last response ids
// For this project we are just storing this in memory in this Map data structure. Real world apps store this in a DB.
const conversations = new Map<string, string>();

app.post('/api/chat', async (req: Request, res: Response) => {
   const { prompt, conversationId } = req.body;

   const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      temperature: 0.2,
      max_output_tokens: 100,
      previous_response_id: conversations.get(conversationId),
   });

   conversations.set(conversationId, response.id);

   res.json({ message: response.output_text });
});

app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
