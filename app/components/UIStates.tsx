import React from 'react';

export const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-200 mb-4"></div>
      <div className="text-yellow-200 text-xl">Loading...</div>
    </div>
  </div>
);

export const ErrorCard = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-400 text-2xl mb-4">😕</div>
      <div className="text-red-400 text-xl mb-8">{message}</div>
      <button 
        onClick={() => window.location.reload()}
        className="inline-block px-6 py-3 bg-yellow-200 text-gray-900 font-bold rounded-full hover:bg-yellow-300 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export const EmptyState = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="text-yellow-200/60 text-2xl mb-4">🎬</div>
      <div className="text-yellow-200/60 text-xl mb-8">{message}</div>
    </div>
  </div>
);

export const NotFound = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="text-yellow-200/60 text-2xl mb-4">🔍</div>
      <div className="text-yellow-200/60 text-xl mb-8">{message}</div>
      <a 
        href="/"
        className="inline-block px-6 py-3 bg-yellow-200 text-gray-900 font-bold rounded-full hover:bg-yellow-300 transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
); 