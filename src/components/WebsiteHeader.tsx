import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface WebsiteHeaderProps {
  className?: string;
}

const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/97 via-blue-900/97 to-slate-800/97 backdrop-blur-md border-b border-white/5 ${className}`}
      style={{
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), 0 8px 16px -4px rgba(232,80,26,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between py-3 sm:py-3.5">
          {/* Logo + Brand */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-3 group"
            style={{ cursor: "default" }}
          >
            <img
              src={`${import.meta.env.BASE_URL}6AMKICK.png`}
              alt="6AMKICK Logo"
              className="h-10 w-auto sm:h-11 drop-shadow-lg filter brightness-110 flex-shrink-0"
            />
            <div className="flex flex-col items-start justify-center">
              <h1
                className="text-lg sm:text-xl font-black tracking-wider leading-none"
                style={{ color: "#1a1a1a" }}
              >
                6AMKICK
              </h1>
              <p
                className="text-[10px] sm:text-[11px] font-normal tracking-wide mt-0.5 leading-none"
                style={{ color: "#E8501A" }}
              >
                Your 6AM running briefing
              </p>
              <div className="h-[2px] w-0 group-hover:w-full bg-brand-orange rounded-full mt-1.5 transition-all duration-300 ease-out" />
            </div>
          </button>

          {/* Nav — About only */}
          <nav className="flex items-center">
            <Link
              to="/about"
              className="text-[11px] uppercase tracking-[0.1em] font-semibold text-gray-400 hover:text-[#E8501A] transition-colors duration-150"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default WebsiteHeader;
