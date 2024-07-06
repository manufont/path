import maplibregl, { GeoJSONSource, MapboxGeoJSONFeature, MapboxOptions } from "maplibre-gl";

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

export type MapTouchEvent = maplibregl.MapTouchEvent & WithFeatures;

export type MapMouseEvent = maplibregl.MapMouseEvent & WithFeatures;

export type DragEvent = MapTouchEvent | MapMouseEvent;

export type GeoJSONFeatureRaw = {
  type: "geojson";
  data: GeoJSON.Feature | GeoJSON.FeatureCollection;
};

export type EnhancedMap = maplibregl.Map & {
  onLayerClick: (layerId: string, onClick: () => void) => void;
  makeLayerDraggable: <T extends GeoJSON.Feature = GeoJSON.Feature>(
    layerId: string,
    onDragMove: DragEventListener<T>,
    onDragEnd: DragEventListener<T>,
    onClick?: DragEventListener<T>
  ) => void;
  addLayerIfNotExist: maplibregl.Map["addLayer"];
  addOrUpdateSource: (id: string, source: GeoJSONFeatureRaw) => GeoJSONSource;
  removeLayerIfExist: maplibregl.Map["removeLayer"];
  removeSourceIfExist: maplibregl.Map["removeLayer"];
};
