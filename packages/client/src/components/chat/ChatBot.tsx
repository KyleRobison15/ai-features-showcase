import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import TypingIndicator from './TypingIndicator';
import type { Message } from './ChatMessages';
import ChatMessages from './ChatMessages';
import ChatInput, { type ChatFormData } from './ChatInput';
import popSound from '@/assets/sounds/pop.mp3';
import notificationSound from '@/assets/sounds/notification.mp3';
import { HiSparkles } from 'react-icons/hi2';

const popAudio = new Audio(popSound);
popAudio.volume = 0.2;

const notificationAudio = new Audio(notificationSound);
notificationAudio.volume = 0.2;

type ChatResponse = {
  message: string;
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const conversationId = useRef(crypto.randomUUID());

  const onSubmit = async ({ prompt }: ChatFormData) => {
    try {
      setMessages((prev) => [
        ...prev,
        {
          content: prompt,
          role: 'user',
        },
      ]);
      setIsBotTyping(true);
      setError('');
      popAudio.play();

      const { data } = await api.post<ChatResponse>('/api/chat', {
        prompt,
        conversationId: conversationId.current,
      });

      setMessages((prev) => [
        ...prev,
        {
          content: data.message,
          role: 'bot',
        },
      ]);
      notificationAudio.play();
    } catch (error) {
      console.error(error); // Use a logging utility in real world app (like Sentry)
      setError('Something went wrong, try again.');
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
          <HiSparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <span className="bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Customer Support Chat
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          This AI-powered chatbot acts as a customer support agent for{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Miller's Mountain Bikes
          </span>
          , a fictional mountain bike shop. Ask questions about store hours,
          products, services, or bike rentals, and the AI will provide helpful
          responses based on the shop's information.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto mb-4">
        <ChatMessages messages={messages} />
        {isBotTyping && <TypingIndicator />}
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <ChatInput onSubmit={onSubmit} />
    </div>
  );
};

export default ChatBot;
