/** Equirectangular projection for static SVG map (display only). */
export function projectLatLng(
  latitude: number,
  longitude: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const x = ((longitude + 180) / 360) * width;
  const y = ((90 - latitude) / 180) * height;
  return { x, y };
}
