import type { KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowUp } from 'react-icons/fa';
import { Button } from '../ui/button';

export type ChatFormData = {
  prompt: string;
};

type Props = {
  onSubmit: (data: ChatFormData) => void;
};

const ChatInput = ({ onSubmit }: Props) => {
  const { register, handleSubmit, reset, formState } = useForm<ChatFormData>();

  const submit = handleSubmit((data) => {
    reset({ prompt: '' });
    onSubmit(data);
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={handleKeyDown}
      className="flex items-end gap-3 border-2 p-3 rounded-3xl"
    >
      <textarea
        {...register('prompt', {
          required: true,
          validate: (data) => data.trim().length > 0,
        })}
        autoFocus
        className="flex-1 border-0 focus:outline-0 resize-none min-h-6 max-h-24 py-2"
        placeholder="Ask anything..."
        maxLength={1000}
        rows={1}
      />
      <Button
        disabled={!formState.isValid}
        className="rounded-full w-9 h-9 shrink-0"
      >
        <FaArrowUp />
      </Button>
    </form>
  );
};

export default ChatInput;
