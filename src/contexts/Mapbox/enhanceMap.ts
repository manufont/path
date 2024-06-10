import mapboxgl, { GeoJSONSource, Point } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { EnhancedMap, DragEvent, MapTouchEvent, DragEventListener } from "./types";

const enhanceMap = (originalMap: mapboxgl.Map) => {
  const map = originalMap as EnhancedMap;
  const canvas = map.getCanvas();
  map.onLayerClick = (layerId, onClick) => {
    map.on("mouseenter", layerId, function () {
      canvas.style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, function () {
      canvas.style.cursor = "";
    });
    map.on("click", layerId, onClick);
  };

  map.makeLayerDraggable = <T extends GeoJSON.Feature = GeoJSON.Feature>(
    layerId: string,
    onDragMove: DragEventListener<T>,
    onDragEnd: DragEventListener<T>,
    onClick?: DragEventListener<T>
  ) => {
    let feature: T | null = null;
    let point: Point | null = null;
    let timeDown: number | null = null;

    const onMove = (e: DragEvent) => {
      if (!feature) return;
      canvas.style.cursor = "grabbing";
      onDragMove(e, feature);
    };

    const onUp = (e: DragEvent) => {
      if (!point || !timeDown || !feature) return;
      // Unbind mouse/touch events
      map.off("mousemove", onMove);
      map.off("touchmove", onMove);

      const delay = Date.now() - timeDown;
      if (e.point.x === point.x && e.point.y === point.y && delay < 200 && onClick) {
        onClick(e, feature);
      } else {
        onDragEnd(e, feature);
      }
      feature = null;
      point = null;
      timeDown = null;
      canvas.style.cursor = "";
    };

    const onDown = (e: DragEvent) => {
      e.preventDefault();
      if (!e.features) return;
      feature = e.features[0] as unknown as T;
      point = e.point;
      timeDown = Date.now();
    };

    const onLayerMouseEnter = () => {
      canvas.style.cursor = "move";
    };

    const onLayerMouseLeave = () => {
      canvas.style.cursor = "";
    };

    const onLayerMouseDown = (e: DragEvent) => {
      onDown(e);
      canvas.style.cursor = "grab";

      map.on("mousemove", onMove);
      map.once("mouseup", onUp);
    };

    const onLayerTouchStart = (e: MapTouchEvent) => {
      if (e.points.length !== 1) return;
      onDown(e);

      map.on("touchmove", onMove);
      map.once("touchend", onUp);
    };

    map.on("mouseenter", layerId, onLayerMouseEnter);
    map.on("mouseleave", layerId, onLayerMouseLeave);
    map.on("mousedown", layerId, onLayerMouseDown);
    map.on("touchstart", layerId, onLayerTouchStart);

    return () => {
      map.off("mouseenter", layerId, onLayerMouseEnter);
      map.off("mouseleave", layerId, onLayerMouseLeave);
      map.off("mousedown", layerId, onLayerMouseDown);
      map.off("touchstart", layerId, onLayerTouchStart);
    };
  };

  map.addLayerIfNotExist = (layer, ...otherArgs) => {
    if (map.getLayer(layer.id)) return map;
    return map.addLayer(layer, ...otherArgs);
  };

  map.addOrUpdateSource = (id, source) => {
    const existingSource = map.getSource(id) as GeoJSONSource;
    const { data } = source;
    if (existingSource && data) {
      existingSource.setData(source.data);
      return existingSource;
    }
    map.addSource(id, source);
    return map.getSource(id) as GeoJSONSource;
  };

  map.removeLayerIfExist = (id) => {
    if (!map.getLayer(id)) return map;
    return map.removeLayer(id);
  };

  map.removeSourceIfExist = (id) => {
    if (!map.getSource(id)) return map;
    return map.removeSource(id);
  };

  return map;
};

export default enhanceMap;
