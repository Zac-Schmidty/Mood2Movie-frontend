"use client";

import { useState } from "react";
import axios from "axios";

interface Movie {
  title: string;
  overview: string;
  rating: number;
  poster: string | null;
}

async function getMoviesFromMood(mood: string) {
  try {
    const response = await fetch("http://127.0.0.1:8000/recommendations/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.detail && typeof errorData.detail === 'object') {
        throw new Error(errorData.detail.message || errorData.detail.error);
      }
      throw new Error(errorData.detail || 'Unable to find movies. Please try again.');
    }

    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Something went wrong. Please try again later.');
  }
}

export default function Home() {
  const [mood, setMood] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mood.trim()) {
      setError('Please enter a mood');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await getMoviesFromMood(mood);
      setMovies(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-400 font-['Geist_Round'] tracking-tight">
            Mood2Movie <span className="text-4xl">🎬</span>
          </h1>
          <p className="text-xl text-yellow-100/80 mb-8 font-medium">
            Discover movies that match your mood
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handlePredict} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow relative">
              <input
                className="w-full px-6 py-4 rounded-full bg-gray-800/50 border border-yellow-200/20 text-yellow-100 placeholder-yellow-100/50 focus:outline-none focus:ring-2 focus:ring-yellow-200/50 focus:border-transparent transition-all shadow-lg"
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="How are you feeling today?"
              />
            </div>
            <button 
              type="submit" 
              className="px-8 py-4 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-300 text-gray-900 font-bold hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding Movies...
                </span>
              ) : (
                'Find Movies'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-900/50 border border-red-500/20 text-red-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {!error && movies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {movies.map((movie, index) => (
              <div 
                key={index} 
                className="bg-gray-800/50 backdrop-blur-sm border border-yellow-200/20 rounded-xl overflow-hidden transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {movie.poster && (
                  <div className="relative h-96">
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-yellow-200/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-md">
                      <span className="text-gray-900 mr-1">★</span>
                      <span className="text-gray-900 font-bold">{movie.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-yellow-100">{movie.title}</h2>
                  <p className="text-yellow-100/70 line-clamp-3">{movie.overview}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}





/*{movies.map((movie, index) => (
  <li key={index} className="text-lg">{movie}*/