import { Injectable } from '@nestjs/common';
import { fetch } from 'undici';

export interface MapResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

@Injectable()
export class MapsService {
  private readonly userAgent = { 'User-Agent': 'mi-app' };

  async searchAddress(q: string): Promise<MapResult[]> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q,
    )}&format=json&addressdetails=1&limit=8&countrycodes=mx`;

    const response = await fetch(url, { headers: this.userAgent });
    if (!response.ok) throw new Error('Error consultando búsqueda');

    return (await response.json()) as MapResult[];
  }

  async reverseGeocode(lat: number, lon: number): Promise<MapResult> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

    const response = await fetch(url, { headers: this.userAgent });
    if (!response.ok) throw new Error('Error consultando reverse');

    return (await response.json()) as MapResult;
  }
}
