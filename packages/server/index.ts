import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { chatController } from './controllers/chat.controller';

// This function from the dotenv library goes into our .env file and loads each one as an environment variable for us automatically
// Without the dotenv library, we would have to create our env vars manually on the command line before running our server every single time
// Needs to be the first line in your module so the env vars are loaded before anything else happens!
dotenv.config();

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

app.post('/api/chat', chatController.sendMessage);

app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
