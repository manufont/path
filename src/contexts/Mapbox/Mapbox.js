import React, { useCallback, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapboxContext = React.createContext();

const OriginalProvider = MapboxContext.Provider;

const enhanceMap = (map) => {
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

  map.makeLayerDraggable = (layerId, onDragMove, onDragEnd, onClick) => {
    let feature = null;
    let point = null;
    let timeDown = null;

    const onMove = (e) => {
      canvas.style.cursor = "grabbing";
      onDragMove(e, feature);
    };

    const onUp = (e) => {
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

    const onDown = (e) => {
      e.preventDefault();
      feature = e.features[0];
      point = e.point;
      timeDown = Date.now();
    };

    const onLayerMouseEnter = () => {
      canvas.style.cursor = "move";
    };

    const onLayerMouseLeave = () => {
      canvas.style.cursor = "";
    };

    const onLayerMouseDown = (e) => {
      onDown(e);
      canvas.style.cursor = "grab";

      map.on("mousemove", onMove);
      map.once("mouseup", onUp);
    };

    const onLayerTouchStart = (e) => {
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

  map.safeRemoveLayer = (layerId) => {
    if (map && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  };

  map.safeRemoveSource = (sourceId) => {
    if (map && map.loaded() && map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  };
  return map;
};

export const MapboxProvider = ({ children, token, options, ...containerProps }) => {
  const [container, setContainer] = useState(null);
  const [map, setMap] = useState(null);

  const containerRef = useCallback(
    (node) => {
      if (node && !container) {
        setContainer(node);
      }
    },
    [container]
  );

  useEffect(() => {
    if (container === null) return;
    mapboxgl.accessToken = token;
    const mapboxMap = new mapboxgl.Map({
      container,
      ...options,
    });
    const onMapLoad = () => setMap(enhanceMap(mapboxMap));
    mapboxMap.on("load", onMapLoad);
    return () => {
      mapboxMap.off("load", onMapLoad);
    };
  }, [container, token, options]);

  return (
    <div ref={containerRef} {...containerProps}>
      {map && <OriginalProvider value={map}>{children}</OriginalProvider>}
    </div>
  );
};

MapboxContext.Provider = MapboxProvider;

export default MapboxContext;
