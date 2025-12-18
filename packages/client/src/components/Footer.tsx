import { BsGithub, BsLinkedin } from 'react-icons/bs';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-background shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Left side - Copyright */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 AI Features Showcase
          </p>

          {/* Right side - Social links */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Created by Kyle Robison
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/KyleRobison15"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                aria-label="KyleRobison15 GitHub"
              >
                <BsGithub size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/kyle-robison/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                aria-label="kyle-robison LinkedIn"
              >
                <BsLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
