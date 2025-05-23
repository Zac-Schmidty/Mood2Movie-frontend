import { MovieDetails, BackendError } from '../types/movie';

const API_BASE_URL = 'http://127.0.0.1:8000';
const TIMEOUT_MS = 8000;

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log(`Fetching: ${url}`); // Debug log
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorDetails = null;

      try {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        errorMessage = errorData.message || errorMessage;
        errorDetails = errorData;
      } catch (e) {
        console.error('Failed to parse error response:', e); // Debug log
        errorMessage = `HTTP Error ${response.status}`;
      }

      throw new ApiError(response.status, errorMessage, errorDetails);
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out');
    }
    // Log the actual error
    console.error('Fetch error:', error);
    throw new ApiError(500, 'Failed to fetch data', error);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

export async function getMovieDetails(movieId: string): Promise<MovieDetails> {
  try {
    console.log(`Fetching movie details for ID: ${movieId}`); // Debug log
    const response = await fetchWithTimeout(`${API_BASE_URL}/movie/${movieId}`);
    const data = await response.json();
    console.log('Received movie data:', data); // Debug log
    
    // Validate required fields
    if (!data.id || !data.title) {
      console.error('Invalid movie data received:', data);
      throw new ApiError(500, 'Invalid movie data received from server');
    }
    
    // Transform poster and backdrop paths to full URLs
    if (data.poster_path) {
      data.poster_path = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    }
    if (data.backdrop_path) {
      data.backdrop_path = `https://image.tmdb.org/t/p/original${data.backdrop_path}`;
    }
    
    return data;
  } catch (error) {
    console.error('Movie details fetch error:', error); // Debug log
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out');
    }
    throw new ApiError(500, 'Failed to fetch movie details', error);
  }
} 