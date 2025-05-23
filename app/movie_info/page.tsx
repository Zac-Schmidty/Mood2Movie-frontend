"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LoadingSpinner, ErrorCard, NotFound } from '../components/UIStates';
import { MovieDetails } from '../types/movie';
import { getMovieDetails, checkBackendHealth } from '../services/api';

export default function MovieInfo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActor, setSelectedActor] = useState<MovieDetails['cast'][0] | null>(null);
  const mood = searchParams.get('mood') || '';

  const handleReturn = () => {
    router.push('/?mood=' + encodeURIComponent(mood));
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check backend health first
        const isHealthy = await checkBackendHealth();
        if (!isHealthy) {
          throw new Error('Backend service is unavailable. Please try again later.');
        }

        const movieId = searchParams.get('id');
        if (!movieId) {
          throw new Error('No movie ID provided');
        }

        console.log('Fetching movie details...'); // Debug log
        const data = await getMovieDetails(movieId);
        console.log('Movie details received:', data); // Debug log
        setMovie(data);
      } catch (err) {
        console.error('Error in initializeData:', err); // Debug log
        if (err instanceof Error) {
          // Handle specific error types
          if (err.name === 'ApiError') {
            const apiError = err as any;
            setError(`${apiError.message}${apiError.details ? `: ${JSON.stringify(apiError.details)}` : ''}`);
          } else {
            setError(err.message);
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [searchParams]);

  // Persist mood in localStorage
  useEffect(() => {
    if (mood) {
      localStorage.setItem('selectedMood', mood);
    }
  }, [mood]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

  if (!movie) {
    return <NotFound message="Movie not found" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-black to-[#1a1a1a] text-yellow-100">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[40vh] sm:h-[45vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-black"></div>
        <div className="relative container mx-auto px-4 h-full flex items-end pb-8 sm:pb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between w-full gap-6 sm:gap-8">
            <div className="max-w-2xl w-full text-center sm:text-left">
              <button 
                onClick={handleReturn}
                className="px-3.5 py-2 bg-yellow-200/90 text-gray-900 text-sm font-medium rounded-full hover:bg-yellow-300 transition-colors flex items-center absolute left-4 sm:left-6 top-4"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return
              </button>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-yellow-200 mb-4 mt-12 sm:mt-0">{movie.title}</h1>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                {movie.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-yellow-200/20 rounded-full text-yellow-200 text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="text-yellow-100/80 text-sm mb-4">
                {movie.release_date} • {movie.runtime} min
              </div>

              {movie.director && (
                <div className="text-yellow-100/80 text-sm">
                  Directed by <span className="text-yellow-200 font-medium">{movie.director.name}</span>
                </div>
              )}
            </div>

            {/* Right side info */}
            <div className="flex flex-col items-center sm:items-end gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-200/90 px-3 py-1 rounded-full flex items-center">
                  <span className="text-gray-900 mr-1">★</span>
                  <span className="text-gray-900 font-bold">{movie.rating.toFixed(1)}</span>
                </div>
                {movie.content_rating && (
                  <div className="bg-yellow-200/90 px-3 py-1 rounded-full text-gray-900 font-bold">
                    {movie.content_rating}
                  </div>
                )}
              </div>

              {movie.trailer && (
                <a 
                  href={`https://www.youtube.com/watch?v=${movie.trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 bg-yellow-200 text-gray-900 font-bold rounded-full hover:bg-yellow-300 transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Trailer
                </a>
              )}
            </div>

            {/* Poster Display */}
            <div className="w-40 h-60 sm:w-48 sm:h-72 rounded-xl overflow-hidden shadow-2xl transform translate-y-0 sm:translate-y-4 bg-[#2a2a2a] transition-all duration-300 hover:shadow-yellow-200/20">
              {movie.poster_path ? (
                <img 
                  src={movie.poster_path} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-yellow-200/50 text-sm">No Poster Available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2a2a2a] backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-yellow-200/20">
            <h2 className="text-xl font-bold text-yellow-200 mb-3">Overview</h2>
            <p className="text-yellow-100/80 leading-relaxed text-sm sm:text-base mb-6">{movie.overview}</p>

            {movie.cast.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold text-yellow-200 mb-4">Cast</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movie.cast.map((actor, index) => (
                    <div 
                      key={index}
                      className="bg-[#2a2a2a] rounded-xl p-4 backdrop-blur-sm border border-yellow-200/10 hover:border-yellow-200/30 transition-all cursor-pointer"
                      onClick={() => setSelectedActor(actor)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          {actor.profile_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt={actor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-yellow-200/10 flex items-center justify-center">
                              <span className="text-yellow-200/50 text-xs">No Photo</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-yellow-200 mb-1">{actor.name}</div>
                          <div className="text-yellow-100/60 text-sm">{actor.character}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actor Details Modal */}
                {selectedActor && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#2a2a2a] rounded-3xl max-w-6xl w-full max-h-[70vh] flex flex-col relative overflow-hidden">
                      <button 
                        onClick={() => setSelectedActor(null)}
                        className="absolute top-4 right-4 text-yellow-200/60 hover:text-yellow-200 z-20 bg-[#2a2a2a]/80 backdrop-blur-sm rounded-full p-2 hover:bg-[#2a2a2a] transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="p-6 overflow-y-auto hide-scrollbar bg-[#2a2a2a]">
                        <div className="flex items-start gap-6 mb-6">
                          <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                            {selectedActor.profile_path ? (
                              <img 
                                src={selectedActor.profile_path}
                                alt={selectedActor.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-yellow-200/10 flex items-center justify-center">
                                <span className="text-yellow-200/50 text-sm">No Photo</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold text-yellow-200 mb-2 truncate">{selectedActor.name}</h3>
                            <div className="text-yellow-100/60 text-sm space-y-1">
                              {selectedActor.birthday && (
                                <div>
                                  <span className="text-yellow-100/40">Born: </span>
                                  {new Date(selectedActor.birthday).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              )}
                              {selectedActor.place_of_birth && (
                                <div className="truncate">
                                  <span className="text-yellow-100/40">From: </span>
                                  {selectedActor.place_of_birth}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Biography Section */}
                        {selectedActor.biography && (
                          <div className="mb-6">
                            <h4 className="text-lg font-bold text-yellow-200 mb-3">Biography</h4>
                            <p className="text-yellow-100/80 text-sm leading-relaxed">
                              {selectedActor.biography}
                            </p>
                          </div>
                        )}

                        {/* Notable Movies Section */}
                        <div className="mt-6">
                          <h4 className="text-lg font-bold text-yellow-200 mb-4">Notable Movies</h4>
                          {selectedActor.notable_movies && selectedActor.notable_movies.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                              {selectedActor.notable_movies.map((movie) => (
                                <div 
                                  key={movie.id}
                                  className="bg-[#2a2a2a] rounded-lg overflow-hidden border border-yellow-200/5 hover:border-yellow-200/20 transition-all cursor-pointer group"
                                  onClick={() => {
                                    // Close the actor modal
                                    setSelectedActor(null);
                                    // Navigate to the new movie
                                    router.push(`/movie_info?id=${movie.id}&mood=${encodeURIComponent(mood)}`);
                                  }}
                                >
                                  <div className="aspect-[2/3] relative">
                                    {movie.poster_path ? (
                                      <img 
                                        src={movie.poster_path}
                                        alt={movie.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-yellow-200/5 flex items-center justify-center">
                                        <span className="text-yellow-200/30 text-xs">No Poster</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-2">
                                    <div className="font-medium text-yellow-200 text-xs mb-0.5 truncate group-hover:text-yellow-100 transition-colors">
                                      {movie.title}
                                    </div>
                                    <div className="text-yellow-100/40 text-xs truncate">{movie.character}</div>
                                    <div className="flex items-center justify-between text-xs mt-1">
                                      <div className="flex items-center text-yellow-200/80">
                                        <span className="mr-0.5">★</span>
                                        {movie.rating.toFixed(1)}
                                      </div>
                                      <div className="text-yellow-100/40">{movie.release_date.split('-')[0]}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-yellow-100/60 text-center py-8">
                              No additional movie information available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
