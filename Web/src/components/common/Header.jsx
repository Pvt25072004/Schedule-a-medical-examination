import React from 'react';
import { ChevronLeft, Settings } from 'lucide-react';

const Header = ({ 
  title, 
  subtitle,
  onBack, 
  onSettings,
  showBack = false,
  showSettings = false,
  rightAction,
  className = ''
}) => {
  return (
    <div className={`bg-teal-500 text-white p-6 rounded-b-3xl shadow-lg ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {showBack && onBack && (
              <button 
                onClick={onBack}
                className="p-2 hover:bg-teal-600 rounded-full transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {rightAction}
            {showSettings && onSettings && (
              <button 
                onClick={onSettings}
                className="p-2 hover:bg-teal-600 rounded-full transition"
              >
                <Settings className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
        
        {subtitle && (
          <p className="text-teal-100">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default Header;