import React from "react";

interface WebsiteHeaderProps {
  className?: string;
}

const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({ className = "" }) => {
  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-800/95 backdrop-blur-md border-b border-amber-200/20 shadow-lg shadow-amber-400/10 ${className}`}
        style={{
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(251, 191, 36, 0.15)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start h-28 sm:h-32 py-4">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-8">
              <div className="flex-shrink-0">
                <img
                  src="/running-blog-final/favicon.png"
                  alt="6AMKICK Logo"
                  className="h-20 w-auto sm:h-22 lg:h-24 drop-shadow-lg filter brightness-110"
                />
              </div>
              <div className="flex flex-col items-center sm:items-start justify-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-wider leading-none drop-shadow-md text-center sm:text-left">
                  6AMKICK
                </h1>
                <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 rounded-full mt-2 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="fixed top-[7.5rem] sm:top-[8.5rem] left-0 right-0 z-40 bg-gradient-to-b from-amber-50/90 to-orange-50/80 backdrop-blur-sm border-b border-amber-100/50">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:py-6">
          <p className="text-center text-amber-700/80 text-xs sm:text-sm font-normal tracking-wide leading-relaxed">
            Posted before sunrise. Built while you sleep. One real run, one real
            reason to move.
          </p>
        </div>
      </div>
    </>
  );
};

export default WebsiteHeader;
