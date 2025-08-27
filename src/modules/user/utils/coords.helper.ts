export function normalizeCoordinates(
  latitude: number,
  longitude: number,
  precision = 6,
): { latitude: number; longitude: number } | undefined {
  if (latitude == null || longitude == null) return undefined;

  const lat = parseFloat(latitude.toFixed(precision));
  const lng = parseFloat(longitude.toFixed(precision));

  if (isNaN(lat) || isNaN(lng)) return undefined;

  return { latitude: lat, longitude: lng };
}
