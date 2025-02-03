import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { MovieData } from '../types/movie.types';

export class MovieStorageService {
  private readonly apiClient: AxiosInstance;
  private static instance: MovieStorageService;

  private constructor(baseURL: string = 'https://chillflix-movie-maker-production.up.railway.app') {
    this.apiClient = axios.create({
      baseURL: `${baseURL}/api/movies`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
      const status = error.response.status;
      const message = error.response.data.detail || error.response.data.message;

      switch (status) {
        case 404:
          return new Error(`Not Found: ${message}`);
        case 500:
          return new Error(`Server Error: ${message}`);
        default:
          return new Error(message || 'API Error');
      }
    }
    return new Error(error.message || 'Unknown Error');
  }

  /**
   * Crea una nueva película en la base de datos
   */
  public async createMovie(movieData: Omit<MovieData, 'id' | 'created_at' | 'updated_at'>): Promise<MovieData> {
    try {
      const response: AxiosResponse<MovieData> = await this.apiClient.post('/create', movieData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todas las películas almacenadas
   */
  public async getAllMovies(): Promise<MovieData[]> {
    try {
      const response: AxiosResponse<MovieData[]> = await this.apiClient.get('/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene una película por su ID
   */
  public async getMovieById(movieId: string): Promise<MovieData> {
    try {
      const response: AxiosResponse<MovieData> = await this.apiClient.get(`/detail/${movieId}`);
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
      const allMovies = await this.getAllMovies();
      return allMovies.find(m => m.tmdb_id === tmdbId) || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una película existente
   */
  public async updateMovie(movieId: string, movieData: Partial<MovieData>): Promise<MovieData> {
    try {
      const response: AxiosResponse<MovieData> = await this.apiClient.put(`/update/${movieId}`, movieData);
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
      await this.apiClient.delete(`/delete/${movieId}`);
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