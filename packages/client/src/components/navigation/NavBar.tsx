import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../ui/button';
import ThemeToggle from '../theme/ThemeToggle';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="w-full bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink
            to="/"
            className="text-xl font-bold cursor-pointer"
            onClick={closeMobileMenu}
          >
            AI Showcase
          </NavLink>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex gap-3 items-center">
            <NavLink to="/">
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  className="cursor-pointer"
                >
                  Home
                </Button>
              )}
            </NavLink>
            <NavLink to="/chatbot">
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  className="cursor-pointer"
                >
                  AI Chatbot
                </Button>
              )}
            </NavLink>
            <NavLink to="/reviews">
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  className="cursor-pointer"
                >
                  Review Summarizer
                </Button>
              )}
            </NavLink>
            <div className="ml-2 pl-2 border-l border-border">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Hamburger Button - Hidden on desktop */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {/* Hamburger Icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu - Hidden on desktop */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 flex flex-col gap-2">
            <NavLink to="/" onClick={closeMobileMenu}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  className="w-full cursor-pointer"
                >
                  Home
                </Button>
              )}
            </NavLink>
            <NavLink to="/chatbot" onClick={closeMobileMenu}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  className="w-full cursor-pointer"
                >
                  AI Chatbot
                </Button>
              )}
            </NavLink>
            <NavLink to="/reviews" onClick={closeMobileMenu}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  className="w-full cursor-pointer"
                >
                  Review Summarizer
                </Button>
              )}
            </NavLink>
            <div className="pt-2 mt-2 border-t border-border flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
