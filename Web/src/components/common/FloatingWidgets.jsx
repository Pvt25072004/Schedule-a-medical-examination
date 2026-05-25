import React, { useState, useEffect } from 'react';
import { ChevronUp, MessageSquare, X } from 'lucide-react';
import Button from './Button';

const FloatingWidgets = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Back to Top Button - Bottom Right */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}
      >
        <button
          onClick={scrollToTop}
          className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-lg shadow-xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>

      {/* Chatbot Trigger & Panel - Bottom Left */}
      <div className="fixed bottom-0 left-6 z-50 flex flex-col items-start">
        
        {/* Chatbot Panel (Slide up) */}
        <div 
          className={`bg-white w-80 sm:w-96 rounded-t-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out origin-bottom ${isChatOpen ? 'max-h-[500px] opacity-100 mb-4' : 'max-h-0 opacity-0 pointer-events-none'}`}
        >
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">Tư vấn sức khỏe</span>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 h-96 flex flex-col items-center justify-center bg-gray-50">
            {/* Chatbot content will go here */}
            <div className="text-gray-400 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Khung Chatbot đang được phát triển...</p>
            </div>
          </div>
        </div>

        {/* Trigger Bar (Sits at the very bottom) */}
        <div 
          className={`bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-6 py-3 rounded-t-xl font-medium shadow-lg flex items-center gap-2 transition-all transform ${isChatOpen ? 'translate-y-full' : 'translate-y-0'}`}
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Tư vấn trực tuyến</span>
        </div>
      </div>
    </>
  );
};

export default FloatingWidgets;
