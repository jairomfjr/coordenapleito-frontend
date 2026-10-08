/**
 * Operações GeoJSON do IBGE (malhas): anéis externos e teste ponto-em-polígono.
 * GeoJSON usa [lng, lat]; Leaflet usa [lat, lng] — manter consistência com pointInRing(lng, lat, ring).
 */

export type LngLat = [number, number];
export type PolygonRings = LngLat[];

/** Ray casting; ring é fechado (primeiro vértice = último). */
export function pointInRing(lng: number, lat: number, ring: PolygonRings): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Vértice em algum polígono (união de partes; só anéis externos — furos/lagos ignorados como no restante do mapa). */
export function pontoDentroDeQualquerAnelExterno(
  lat: number,
  lng: number,
  aneis: PolygonRings[]
): boolean {
  if (aneis.length === 0) return false;
  return aneis.some((ring) => pointInRing(lng, lat, ring));
}

/** Extrai apenas o anel externo de cada Polygon / parte do MultiPolygon (e recursão em GeometryCollection). */
export function extrairAneisExternos(geo: GeoJSON.GeoJsonObject): PolygonRings[] {
  const rings: PolygonRings[] = [];
  const addGeometry = (geometry: GeoJSON.Geometry | null | undefined) => {
    if (!geometry) return;
    if (geometry.type === 'Polygon') {
      const outer = geometry.coordinates?.[0];
      if (outer && outer.length >= 3) rings.push(outer as LngLat[]);
      return;
    }
    if (geometry.type === 'MultiPolygon') {
      geometry.coordinates?.forEach((poly) => {
        const outer = poly?.[0];
        if (outer && outer.length >= 3) rings.push(outer as LngLat[]);
      });
      return;
    }
    if (geometry.type === 'GeometryCollection') {
      geometry.geometries?.forEach((g) => addGeometry(g));
    }
  };
  if (geo.type === 'Feature' && 'geometry' in geo) {
    addGeometry(geo.geometry as GeoJSON.Geometry | null | undefined);
  } else if (geo.type === 'FeatureCollection' && 'features' in geo) {
    (geo.features as GeoJSON.Feature[] | undefined)?.forEach((f: GeoJSON.Feature) =>
      addGeometry(f.geometry as GeoJSON.Geometry | null | undefined)
    );
  } else {
    addGeometry(geo as GeoJSON.Geometry);
  }
  return rings;
}
