import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
          <path d="M16 2L4 9V23L16 30L28 23V9L16 2Z" fill="#13B8A9" stroke="#11A394" strokeWidth="2"/>
          <path d="M16 9L10 12.5V19.5L16 23L22 19.5V12.5L16 9Z" fill="white" stroke="#11A394" strokeWidth="1.5"/>
        </svg>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          <span className="text-slate-700 font-medium">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;