// API client for The Perfect Shot backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api';
console.log(`[ApiClient] Base URL set to: ${API_BASE_URL}`);

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  bortleScale: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherForecast {
  id: string;
  date: string;
  cloudCover: number;
  seeing?: number;
  skyScore?: number;
  locationId: string;
  retrievedAt: string;
}

export interface LocationWithForecast extends Location {
  forecasts: WeatherForecast[];
}

export interface CelestialEvent {
  id: string;
  name: string;
  startDate: string;
  peakDate: string;
  endDate: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  imageUrl: string;
  celestialTarget?: string;
  cameraMetadata?: Record<string, unknown>;
  userId: string;
  locationId: string;
  createdAt: string;
  location?: Location;
  user?: {
    email: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers);
    headers.set('Content-Type', 'application/json');

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Vercel Deployment Protection Bypass for build-time fetching
    const bypassToken = process.env.VERCEL_BYPASS_TOKEN;
    if (bypassToken) {
      headers.set('x-vercel-protection-skip', bypassToken);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    return this.fetch<Location[]>('/locations');
  }

  async getLocation(id: string): Promise<Location> {
    return this.fetch<Location>(`/locations/${id}`);
  }

  async getLocationWithForecast(id: string): Promise<LocationWithForecast> {
    return this.fetch<LocationWithForecast>(`/locations/${id}/forecast`);
  }

  // Celestial Events
  async getCelestialEvents(days?: number): Promise<CelestialEvent[]> {
    const query = days ? `?days=${days}` : '';
    return this.fetch<CelestialEvent[]>(`/celestial-events${query}`);
  }

  // Photos
  async getPublicPhotos(): Promise<Photo[]> {
    return this.fetch<Photo[]>('/photos/public');
  }

  async getUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string, imageUrl: string, key: string }> {
    return this.fetch<{ uploadUrl: string, imageUrl: string, key: string }>(
      `/photos/upload-url?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`
    );
  }

  async createPhoto(data: { imageUrl: string, celestialTarget?: string, locationId: string }): Promise<Photo> {
    return this.fetch<Photo>('/photos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
