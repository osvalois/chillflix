import axios from 'axios';

const TMDB_API_KEY = '466fcb69c820905983bdd53d3a80a842';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

import { UserPreferences, RecommendationParams, Genre, ContentType, CombinedContent, SearchResult, MovieCredits, MovieReviewsResponse, Review, TMDBMovie, TMDBTVSeries } from '../types';



export type TMDBContent = TMDBMovie | TMDBTVSeries;
export const getMovieReviews = async (movieId: string, page: number = 1): Promise<MovieReviewsResponse> => {
  try {
    const response = await axios.get<MovieReviewsResponse>(`${TMDB_BASE_URL}/movie/${movieId}/reviews`, {
      params: {
        api_key: TMDB_API_KEY,
        page,
      },
    });

    // Añadimos campos personalizados que no vienen directamente de la API de TMDB
    const enhancedResults: Review[] = response.data.results.map(review => ({
      ...review,
      likes: Math.floor(Math.random() * 100), // Simulamos likes (en una app real, esto vendría de tu backend)
      dislikes: Math.floor(Math.random() * 50), // Simulamos dislikes
    }));

    return {
      ...response.data,
      results: enhancedResults,
    };
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    throw error;
  }
};
const mapToSearchResult = (item: TMDBContent): SearchResult => ({
  id: item.id,
  title: 'title' in item ? item.title : item.name,
  overview: item.overview,
  poster_path: item.poster_path,
  vote_average: item.vote_average,
  release_date: 'release_date' in item ? item.release_date : item.first_air_date,
  type: 'title' in item ? ContentType.Movie : ContentType.TVSeries,
  media_type: 'title' in item ? 'movie' : 'tv',
});

const mapToCombinedContent = (item: TMDBContent): CombinedContent => ({
  ...item,
  type: 'title' in item ? ContentType.Movie : ContentType.TVSeries,
  year: new Date('release_date' in item ? item.release_date : item.first_air_date).getFullYear(),
});

export const searchTMDBMovies = async (query: string, page: number = 1): Promise<SearchResult[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page,
      },
    });
    return response.data.results.map(mapToSearchResult);
  } catch (error) {
    console.error('Error searching TMDB movies:', error);
    throw error;
  }
};

export const searchTMDBTVSeries = async (query: string, page: number = 1): Promise<SearchResult[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page,
      },
    });
    return response.data.results.map(mapToSearchResult);
  } catch (error) {
    console.error('Error searching TMDB TV series:', error);
    throw error;
  }
};


export const searchTMDBContent = async (
  query: string, 
  page: number = 1, 
  contentType: ContentType | 'both' = 'both'
): Promise<SearchResult[]> => {
  try {
    let results: SearchResult[] = [];

    if (contentType === 'both' || contentType === ContentType.Movie) {
      const movieResults = await searchTMDBMovies(query, page);
      results = [...results, ...movieResults];
    }

    if (contentType === 'both' || contentType === ContentType.TVSeries) {
      const tvResults = await searchTMDBTVSeries(query, page);
      results = [...results, ...tvResults];
    }

    return results;
  } catch (error) {
    console.error('Error searching TMDB content:', error);
    throw error;
  }
};

// Simple cache to store recent search results
const searchCache: { [key: string]: { timestamp: number; results: SearchResult[] } } = {};

export const fetchSearchSuggestions = async (inputValue: string): Promise<SearchResult[]> => {
  if (inputValue.length < 2) {
    return [];
  }

  // Check cache first
  const cacheKey = inputValue.toLowerCase();
  const cachedResult = searchCache[cacheKey];
  if (cachedResult && Date.now() - cachedResult.timestamp < 5 * 60 * 1000) { // 5 minutes cache
    return cachedResult.results;
  }

  try {
    const results = await searchTMDBContent(inputValue, 1, 'both');
    
    // Improved sorting algorithm
    const sortedResults = results.sort((a, b) => {
      // Prioritize exact matches
      if (a.title.toLowerCase() === inputValue.toLowerCase()) return -1;
      if (b.title.toLowerCase() === inputValue.toLowerCase()) return 1;

      // Then prioritize titles that start with the input
      if (a.title.toLowerCase().startsWith(inputValue.toLowerCase())) return -1;
      if (b.title.toLowerCase().startsWith(inputValue.toLowerCase())) return 1;

      // Then consider popularity and vote count
      const aPopularity = (a.vote_average * a.vote_count) || 0;
      const bPopularity = (b.vote_average * b.vote_count) || 0;
      return bPopularity - aPopularity;
    });

    // Ensure diversity in results (mix of movies and TV shows)
    const diverseResults = [];
    const movieResults = sortedResults.filter(item => item.type === ContentType.Movie);
    const tvResults = sortedResults.filter(item => item.type === ContentType.TVSeries);

    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0 && movieResults.length > 0) {
        diverseResults.push(movieResults.shift()!);
      } else if (tvResults.length > 0) {
        diverseResults.push(tvResults.shift()!);
      } else if (movieResults.length > 0) {
        diverseResults.push(movieResults.shift()!);
      } else if (tvResults.length > 0) {
        diverseResults.push(tvResults.shift()!);
      }
    }

    // Cache the results
    searchCache[cacheKey] = { timestamp: Date.now(), results: diverseResults };

    return diverseResults;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
};

// Function to clear old cache entries
export const clearOldCacheEntries = () => {
  const now = Date.now();
  Object.keys(searchCache).forEach(key => {
    if (now - searchCache[key].timestamp > 30 * 60 * 1000) { // 30 minutes
      delete searchCache[key];
    }
  });
};

// Call this function periodically or on app start
setInterval(clearOldCacheEntries, 5 * 60 * 1000); // Every 5 minutes
export const getTrendingContent = async (): Promise<CombinedContent[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/all/day`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    return response.data.results.map(mapToCombinedContent);
  } catch (error) {
    console.error('Error fetching trending content:', error);
    throw error;
  }
};

export const searchAllContent = async (query: string, page: number = 1): Promise<CombinedContent[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page,
      },
    });
    return response.data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map(mapToCombinedContent);
  } catch (error) {
    console.error('Error searching all content:', error);
    throw error;
  }
};
export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

export const getTopRated = async (page: number = 1): Promise<CombinedContent[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
      params: {
        api_key: TMDB_API_KEY,
        page,
      },
    });
    return response.data.results.map(mapToCombinedContent);
  } catch (error) {
    console.error('Error fetching top rated content:', error);
    throw error;
  }
};

export const getUpcoming = async (page: number = 1): Promise<CombinedContent[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
      params: {
        api_key: TMDB_API_KEY,
        page,
      },
    });
    return response.data.results.map(mapToCombinedContent);
  } catch (error) {
    console.error('Error fetching upcoming content:', error);
    throw error;
  }
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences> => {
  // In a real app, this would fetch user preferences from a backend
  // For now, we'll return mock data
  return {
    favoriteGenres: [28, 12, 16], // Action, Adventure, Animation
    favoriteActors: [500, 287, 1245], // Example actor IDs
    watchHistory: [550, 238, 680], // Example movie IDs
    ratings: { 550: 5, 238: 4, 680: 3 }, // Example ratings
  };
};
export const getRecommendationsMovies = async (): Promise<CombinedContent[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page: 1,
      },
    });
    
    const popularMovies = response.data.results.map(mapToCombinedContent);
    

    return popularMovies;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};
export const getRecommendations = async (params: RecommendationParams): Promise<CombinedContent[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page: 1,
      },
    });
    
    const popularMovies = response.data.results.map(mapToCombinedContent);
    
    // Asegúrate de que los géneros existan antes de filtrar
    const recommendations = popularMovies.filter(movie => 
      movie.genres && movie.genres.some(genre => params.preferences.favoriteGenres.includes(genre.id))
    );

    return recommendations.slice(0, params.limit || 10);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const getTMDBMovieDetails = async (tmdbId: number): Promise<CombinedContent> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'videos',
      },
    });
    return mapToCombinedContent({ ...response.data, media_type: 'movie' });
  } catch (error) {
    console.error('Error fetching TMDB movie details:', error);
    throw error;
  }
};

export const getTMDBTVSeriesDetails = async (tmdbId: number): Promise<CombinedContent> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'videos',
      },
    });
    return mapToCombinedContent({ ...response.data, media_type: 'tv' });
  } catch (error) {
    console.error('Error fetching TMDB TV series details:', error);
    throw error;
  }
};

export const getMovieCredits = async (tmdbId: number): Promise<MovieCredits> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}/credits`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
};

export const getSimilarMovies = async (tmdbId: number): Promise<CombinedContent[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}/similar`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    return response.data.results.map(mapToCombinedContent);
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
};
const tmdbService = {
  searchTMDBMovies,
  searchTMDBTVSeries,
  getTMDBMovieDetails,
  getTMDBTVSeriesDetails,
  searchTMDBContent,
  fetchSearchSuggestions,
  getTrendingContent,
  searchAllContent,
  getGenres,
  getTopRated,
  getUpcoming,
  getUserPreferences,
  getRecommendations,
  getMovieCredits,
  getSimilarMovies,
  getMovieReviews,
  getRecommendationsMovies
};

export default tmdbService;