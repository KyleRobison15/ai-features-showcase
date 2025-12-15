import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '../ui/button';
import { MdLightMode } from 'react-icons/md';
import { MdOutlineDarkMode } from 'react-icons/md';

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={
        resolvedTheme === 'light'
          ? 'Switch to dark mode'
          : 'Switch to light mode'
      }
      title={
        resolvedTheme === 'light'
          ? 'Switch to dark mode'
          : 'Switch to light mode'
      }
    >
      {resolvedTheme === 'light' ? (
        <MdLightMode className="w-5 h-5" />
      ) : (
        <MdOutlineDarkMode className="w-5 h-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
