import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  constructor(private http: HttpService) {}

  async isAddressFor(lat: number, lng: number): Promise<boolean> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    try {
      const resp$ = this.http.get(url, { headers: { 'User-Agent': 'MyApp/1.0' }, timeout: 5000 });
      const resp = await lastValueFrom(resp$);
      const data = resp.data;
      return !!(data?.address && (data.address.road || data.address.city || data.address.village));
    } catch (e) {
      this.logger.warn('Geocoding error', e);
      return false;
    }
  }
}
