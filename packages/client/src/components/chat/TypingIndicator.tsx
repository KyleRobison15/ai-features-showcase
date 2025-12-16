import { HiSparkles } from 'react-icons/hi2';

type SparkleProps = {
  className?: string;
};

const Sparkle = ({ className }: SparkleProps) => (
  <HiSparkles className={`w-3 h-3 text-white animate-pulse ${className}`} />
);

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-0.5 px-4 py-3 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl self-start ml-3">
      <Sparkle />
      <Sparkle className="[animation-delay:0.2s]" />
      <Sparkle className="[animation-delay:0.4s]" />
    </div>
  );
};

export default TypingIndicator;
