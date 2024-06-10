import mapboxgl, { GeoJSONSource, MapboxGeoJSONFeature, MapboxOptions } from "mapbox-gl";

export type MapState = {
  container: HTMLElement;
  options: Omit<MapboxOptions, "container">;
};

export type MapboxContextType = {
  map: EnhancedMap | null;
  registerMap: (mapState: MapState) => void;
};

export type DragEventListener<T extends GeoJSON.Feature = GeoJSON.Feature> = (
  e: DragEvent,
  feature: T
) => void;

export type WithFeatures = {
  features?: MapboxGeoJSONFeature[];
};

export type MapTouchEvent = mapboxgl.MapTouchEvent & WithFeatures;

export type MapMouseEvent = mapboxgl.MapMouseEvent & WithFeatures;

export type DragEvent = MapTouchEvent | MapMouseEvent;

export type GeoJSONFeatureRaw = {
  type: "geojson",
  data: GeoJSON.Feature | GeoJSON.FeatureCollection;
}

export type EnhancedMap = mapboxgl.Map & {
  onLayerClick: (layerId: string, onClick: () => void) => void;
  makeLayerDraggable: <T extends GeoJSON.Feature = GeoJSON.Feature>(
    layerId: string,
    onDragMove: DragEventListener<T>,
    onDragEnd: DragEventListener<T>,
    onClick?: DragEventListener<T>
  ) => void;
  addLayerIfNotExist: mapboxgl.Map["addLayer"];
  addOrUpdateSource: (id: string, source: GeoJSONFeatureRaw) => GeoJSONSource;
  removeLayerIfExist: mapboxgl.Map["removeLayer"];
  removeSourceIfExist: mapboxgl.Map["removeLayer"];
};
