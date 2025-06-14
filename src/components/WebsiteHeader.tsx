import React from "react";

interface WebsiteHeaderProps {
  className?: string;
}

const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({ className = "" }) => {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start h-16 sm:h-20">
          {/* Logo and Brand Name Container */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src="/running-blog-final/6AMKICK.png"
                alt="The 6AM Kick Logo"
                className="h-10 w-auto sm:h-12 drop-shadow-sm"
              />
            </div>

            {/* Brand Name */}
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight leading-none">
                THE 6AM KICK
              </h1>
              <div className="h-0.5 bg-gradient-to-r from-orange-400 to-amber-300 rounded-full mt-1 opacity-80"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WebsiteHeader;
