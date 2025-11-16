import { Controller, Get, Query } from '@nestjs/common';
import { MapsService } from '../maps.service';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('search')
  search(@Query('q') q: string) {
    if (!q) return [];
    return this.mapsService.searchAddress(q);
  }

  @Get('reverse')
  reverse(@Query('lat') lat: string, @Query('lon') lon: string) {
    if (!lat || !lon) return null;
    return this.mapsService.reverseGeocode(Number(lat), Number(lon));
  }
}
