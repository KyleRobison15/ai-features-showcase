import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';

// This function from the dotenv library goes into our .env file and loads each one as an environment variable for us automatically
    // Without the dotenv library, we would have to create our env vars manually on the command line before running our server every single time
// Needs to be the first line in your module so the env vars are loaded before anything else happens!
dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
})

app.get('/api/hello', (req: Request, res: Response) => {
    res.send({message: 'Hello World!'});
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})