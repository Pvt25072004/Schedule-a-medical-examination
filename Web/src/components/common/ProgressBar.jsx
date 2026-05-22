import React from 'react';
import { CheckCircle } from 'lucide-react';
import Card from './Card';

const ProgressBar = ({ steps, currentStep, onStepClick }) => {
  return (
    <Card className="mb-8 overflow-x-auto">
      <div className="relative flex items-start justify-between min-w-[600px] sm:min-w-0 w-full pt-2">
        {/* Background Lines */}
        <div className="absolute top-[28px] sm:top-[34px] left-0 w-full h-1 bg-gray-200 z-0" style={{ transform: 'translateY(-50%)' }} />
        
        {/* Active Line (Progress) */}
        <div 
          className="absolute top-[28px] sm:top-[34px] left-0 h-1 bg-blue-600 z-0 transition-all duration-300"
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            transform: 'translateY(-50%)'
          }} 
        />

        {steps.map((s, index) => (
          <div 
            key={s.number}
            className={`relative z-10 flex flex-col items-center flex-1 ${s.number < currentStep && onStepClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={() => {
              if (s.number < currentStep && onStepClick) {
                onStepClick(s.number);
              }
            }}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                currentStep >= s.number
                  ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-50"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > s.number ? (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                s.icon && <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <p
              className={`text-xs sm:text-sm mt-2 font-medium text-center px-1 ${
                currentStep >= s.number ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {s.title}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProgressBar;
