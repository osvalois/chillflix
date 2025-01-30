
  // services/movieStorageService.ts
  import axios, { AxiosInstance, AxiosResponse } from 'axios';
  
  export class MovieStorageService {
    private readonly apiClient: AxiosInstance;
    private static instance: MovieStorageService;
  
    private constructor(baseURL: string = 'https://chillflix-indexer-movie-maker-production.up.railway.app') {
      this.apiClient = axios.create({
        baseURL: `${baseURL}/api/movies`,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Interceptor para manejar errores
      this.apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error('API Error:', error);
          return Promise.reject(this.handleError(error));
        }
      );
    }
  
    public static getInstance(baseURL?: string): MovieStorageService {
      if (!MovieStorageService.instance) {
        MovieStorageService.instance = new MovieStorageService(baseURL);
      }
      return MovieStorageService.instance;
    }
  
    private handleError(error: any): Error {
      if (error.response) {
        return new Error(
          error.response.data.detail || error.response.data.message || 'API Error'
        );
      }
      return new Error(error.message || 'Unknown Error');
    }
  
    /**
     * Crea una nueva película en la base de datos
     */
    public async createMovie(movieData: Omit<MovieData, 'id' | 'created_at' | 'updated_at'>): Promise<MovieData> {
      try {
        const response: AxiosResponse<MovieData> = await this.apiClient.post('', movieData);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Obtiene una película por su TMDB ID
     */
    public async getMovieByTmdbId(tmdbId: number): Promise<MovieData | null> {
      try {
        const response: AxiosResponse<MovieData[]> = await this.apiClient.get('');
        const movie = response.data.find(m => m.tmdb_id === tmdbId);
        return movie || null;
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Obtiene todas las películas almacenadas
     */
    public async getAllMovies(): Promise<MovieData[]> {
      try {
        const response: AxiosResponse<MovieData[]> = await this.apiClient.get('');
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Actualiza una película existente
     */
    public async updateMovie(movieId: string, movieData: Partial<MovieData>): Promise<MovieData> {
      try {
        const response: AxiosResponse<MovieData> = await this.apiClient.put(`/${movieId}`, movieData);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Elimina una película
     */
    public async deleteMovie(movieId: string): Promise<boolean> {
      try {
        await this.apiClient.delete(`/${movieId}`);
        return true;
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Guarda o actualiza una película basada en su TMDB ID
     */
    public async saveOrUpdateMovie(movieData: Omit<MovieData, 'id' | 'created_at' | 'updated_at'>): Promise<MovieData> {
      try {
        const existingMovie = await this.getMovieByTmdbId(movieData.tmdb_id);
        
        if (existingMovie) {
          return await this.updateMovie(existingMovie.id!, movieData);
        } else {
          return await this.createMovie(movieData);
        }
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Procesa películas en lote
     */
    public async processBatchMovies(movies: Omit<MovieData, 'id' | 'created_at' | 'updated_at'>[]): Promise<MovieData[]> {
      try {
        const results = await Promise.all(
          movies.map(movie => this.saveOrUpdateMovie(movie))
        );
        return results;
      } catch (error) {
        throw error;
      }
    }
  
    /**
     * Busca películas por coincidencia parcial en el título
     */
    public async searchMoviesByTitle(title: string): Promise<MovieData[]> {
      try {
        const allMovies = await this.getAllMovies();
        return allMovies.filter(movie => 
          movie.title.toLowerCase().includes(title.toLowerCase())
        );
      } catch (error) {
        throw error;
      }
    }
  }
  
  // Ejemplo de uso en un componente React o hook
  /*
  import { MovieStorageService } from './services/movieStorageService';
  
  const movieService = MovieStorageService.getInstance();
  
  // En un componente o hook
  const saveMovie = async (movieData: MovieData) => {
    try {
      const result = await movieService.saveOrUpdateMovie({
        tmdb_id: movieData.tmdb_id,
        title: movieData.title,
        classification: movieData.classification,
        torrent_hash: movieData.torrent_hash,
        resource_index: movieData.resource_index
      });
      console.log('Movie saved:', result);
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  };
  */
  
  // Hook personalizado para usar el servicio
  import { useState, useCallback } from 'react';
import { MovieData } from '../types/movie.types';
  
  export const useMovieStorage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const movieService = MovieStorageService.getInstance();
  
    const saveMovie = useCallback(async (movieData: Omit<MovieData, 'id' | 'created_at' | 'updated_at'>) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await movieService.saveOrUpdateMovie(movieData);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    const getMovie = useCallback(async (tmdbId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await movieService.getMovieByTmdbId(tmdbId);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    return {
      saveMovie,
      getMovie,
      isLoading,
      error
    };
  };