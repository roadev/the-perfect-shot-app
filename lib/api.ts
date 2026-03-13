// API client for The Perfect Shot backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
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
}

export const api = new ApiClient(API_BASE_URL);
