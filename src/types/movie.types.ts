// types/
export interface MovieData {
    movieDuration: number;
    id?: string;
    tmdb_id: number;
    title: string;
    classification: string;
    torrent_hash: string;
    resource_index: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
  }
  