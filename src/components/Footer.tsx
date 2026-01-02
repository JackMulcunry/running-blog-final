import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} 6AMKICK. A performance-focused running blog.
            </p>
          </div>
          <nav className="flex gap-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
              About
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
