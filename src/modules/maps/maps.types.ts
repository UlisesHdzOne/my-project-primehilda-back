export interface MapResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  bounding_box: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address: {
    [key: string]: string;
  };
}

export interface ReverseGeocodeResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    [key: string]: string;
  };
  boundingbox: string[];
}

export interface NominatimSearchParams {
  q: string;
  format?: string;
  addressdetails?: number;
  limit?: number;
  countrycodes?: string;
  viewbox?: string;
  bounded?: number;
}

export interface NominatimReverseParams {
  lat: number;
  lon: number;
  format?: string;
  addressdetails?: number;
  zoom?: number;
}

export interface SearchResponse {
  success: boolean;
  data: MapResult[];
  metadata: {
    count: number;
    query: string;
    limit: number;
  };
}

export interface ReverseGeocodeResponse {
  success: boolean;
  data: ReverseGeocodeResult;
  metadata: {
    lat: number;
    lon: number;
  };
}
