export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  rating: number;
  vote_count: number;
  content_rating: string | null;
  genres: string[];
  cast: CastMember[];
  director: Director | null;
  writers: Writer[];
  trailer: Video | null;
  teaser: Video | null;
  similar_movies: SimilarMovie[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  notable_movies: NotableMovie[];
}

export interface NotableMovie {
  id: number;
  title: string;
  poster_path: string;
  character: string;
  release_date: string;
  rating: number;
  popularity: number;
}

export interface Director {
  name: string;
  profile_path: string | null;
}

export interface Writer {
  name: string;
  job: string;
  profile_path: string | null;
}

export interface Video {
  name: string;
  key: string;
  type: string;
}

export interface SimilarMovie {
  id: number;
  title: string;
  poster_path: string | null;
  rating: number;
}

export interface BackendError {
  error: string;
  message: string;
  status: number;
} 