import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          AI Features Showcase
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore modern, AI-powered features built the right way.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="border rounded-lg p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-semibold">AI Chatbot</h2>
            <p className="text-muted-foreground">
              Chat with an AI-powered customer support agent for Miller's
              Mountain Bikes. Get instant answers about products, services, and
              store hours.
            </p>
            <Link to="/chatbot">
              <Button className="w-full">Try Chatbot</Button>
            </Link>
          </div>

          <div className="border rounded-lg p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-semibold">Review Summarizer</h2>
            <p className="text-muted-foreground">
              View product reviews with AI-generated summaries. Quickly
              understand customer sentiment and key points without reading every
              review.
            </p>
            <Link to="/reviews">
              <Button className="w-full">Try Review Summarizer</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
