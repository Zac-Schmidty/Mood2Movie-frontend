"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import axios from "axios";
import Link from "next/link";

interface Movie {
  title: string;
  overview: string;
  rating: number;
  poster: string | null;
  id: string;
}

interface MovieResponse {
  recommendations: Movie[];
  total_pages: number;
  current_page: number;
}

async function getMoviesFromMood(mood: string, page: number = 1) {
  try {
    const response = await fetch("http://127.0.0.1:8000/recommendations/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, page }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.detail && typeof errorData.detail === 'object') {
        throw new Error(errorData.detail.message || errorData.detail.error);
      }
      throw new Error(errorData.detail || 'Unable to find movies. Please try again.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Something went wrong. Please try again later.');
  }
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mood, setMood] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const moodParam = searchParams.get('mood');
    
    // Check if we're returning from movie info page
    const savedState = sessionStorage.getItem('movieListState');
    console.log('Checking for saved state:', savedState);
    
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      console.log('Restoring saved state:', parsedState);
      setMood(parsedState.mood);
      setMovies(parsedState.movies);
      setCurrentPage(parsedState.currentPage);
      setTotalPages(parsedState.totalPages);
      
      // Restore scroll position after state is set
      requestAnimationFrame(() => {
        const savedScroll = sessionStorage.getItem('movieListScroll');
        if (savedScroll) {
          window.scrollTo(0, parseInt(savedScroll));
          sessionStorage.removeItem('movieListScroll');
        }
        sessionStorage.removeItem('movieListState');
      });
      return;
    }
    
    if (moodParam) {
      console.log('No saved state, using mood param:', moodParam);
      setMood(moodParam);
      // Check if we have movies in localStorage for this mood and page
      const storedMovies = localStorage.getItem(`movies_${moodParam}_${currentPage}`);
      if (storedMovies) {
        const parsedData = JSON.parse(storedMovies);
        console.log('Found stored movies:', parsedData);
        setMovies(parsedData.recommendations);
        setTotalPages(parsedData.total_pages);
      } else {
        console.log('No stored movies, fetching new ones');
        // If no stored movies, fetch them
        handlePredict(new Event('submit') as any, moodParam);
      }
    }
  }, [searchParams]);

  const handlePredict = async (e: React.FormEvent, moodParam?: string, page: number = 1) => {
    e.preventDefault();
    
    const moodToUse = moodParam || mood;
    if (!moodToUse.trim()) {
      setError('Please enter a mood');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await getMoviesFromMood(moodToUse, page);
      if (page === 1) {
        setMovies(result.recommendations);
        // Only update URL on initial search (page 1)
        router.push(`/?mood=${encodeURIComponent(moodToUse)}`);
      } else {
        setMovies(prev => [...prev, ...result.recommendations]);
      }
      setTotalPages(result.total_pages);
      setCurrentPage(page);
      // Store movies in localStorage
      localStorage.setItem(`movies_${moodToUse}_${page}`, JSON.stringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      if (page === 1) {
        setMovies([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (currentPage >= totalPages || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      await handlePredict(new Event('submit') as any, mood, currentPage + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Add a function to save the current state
  const saveCurrentState = () => {
    const state = {
      mood,
      movies,
      currentPage,
      totalPages
    };
    console.log('Saving state before navigation:', state);
    sessionStorage.setItem('movieListState', JSON.stringify(state));
    sessionStorage.setItem('movieListScroll', window.scrollY.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-400 font-['Geist_Round'] tracking-tight">
            Mood2Movie <span className="text-3xl sm:text-4xl">🎬</span>
          </h1>
          <p className="text-lg sm:text-xl text-yellow-100/80 mb-6 sm:mb-8 font-medium">
            Discover movies that match your mood
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <form onSubmit={(e) => handlePredict(e)} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-grow relative">
        <input
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-[#1a1a1a] border border-yellow-200/20 text-yellow-100 placeholder-yellow-100/50 focus:outline-none focus:ring-2 focus:ring-yellow-200/50 focus:border-transparent transition-all shadow-lg text-sm sm:text-base"
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
                placeholder="How are you feeling today?"
        />
            </div>
            <button 
              type="submit" 
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-300 text-gray-900 font-bold hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="bg-red-900/50 border border-red-500/20 text-red-200 rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base sm:text-lg font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {!error && movies.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {movies.map((movie, index) => (
                <Link 
                  href={`/movie_info?id=${movie.id}&mood=${encodeURIComponent(mood)}`}
                  onClick={saveCurrentState}
                  key={`${movie.id}-${index}`}
                  className="group relative overflow-hidden rounded-xl bg-[#1a1a1a] backdrop-blur-sm border border-yellow-200/20 hover:border-yellow-200/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-200/10"
                >
                  {movie.poster && (
                    <div className="relative h-64 sm:h-96">
                      <img 
                        src={movie.poster} 
                        alt={movie.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-yellow-200/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full flex items-center shadow-md">
                        <span className="text-gray-900 mr-1">★</span>
                        <span className="text-gray-900 font-bold text-sm sm:text-base">{movie.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-yellow-100">{movie.title}</h2>
                    <p className="text-yellow-100/70 line-clamp-3 text-sm sm:text-base">{movie.overview}</p>
                  </div>
                </Link>
        ))}
            </div>

            {/* Load More Section */}
            {currentPage < totalPages && (
              <div className="mt-8 sm:mt-12 text-center">
                <button
                  onClick={loadMoreMovies}
                  disabled={isLoadingMore}
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-300 text-gray-900 font-bold hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg text-sm sm:text-base"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading More...
                    </span>
                  ) : (
                    'Load More Movies'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}





/*{movies.map((movie, index) => (
  <li key={index} className="text-lg">{movie}*/