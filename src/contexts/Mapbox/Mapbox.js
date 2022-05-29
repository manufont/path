import React, { useCallback, useState, useEffect, useContext } from "react";
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

  return map;
};

const MapboxProvider = ({ children }) => {
  const [mapState, setMapState] = useState(null);
  const [map, setMap] = useState(null);

  const registerMap = useCallback(
    (newMapState) => {
      if (!mapState) {
        setMapState(newMapState);
        return;
      }
      const savedContainer = mapState.container;
      const { container } = newMapState;
      if (savedContainer === container) return;
      const parentNode = container.parentNode;
      parentNode.removeChild(container);
      parentNode.appendChild(savedContainer);
      map.resize();
    },
    [map, mapState]
  );

  useEffect(() => {
    if (mapState === null) return;
    const { container, options } = mapState;
    const mapboxMap = new mapboxgl.Map({
      container,
      ...options,
    });
    const onMapLoad = () => setMap(enhanceMap(mapboxMap));
    mapboxMap.on("load", onMapLoad);
    return () => {
      mapboxMap.off("load", onMapLoad);
    };
  }, [mapState]);

  return <OriginalProvider value={{ map, registerMap }}>{children}</OriginalProvider>;
};

const Map = ({ children, options, ...containerProps }) => {
  const { map, registerMap } = useContext(MapboxContext);

  const containerRef = useCallback((node) => {
    if (!node) return;
    registerMap({
      container: node,
      options,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} {...containerProps}>
      {map && children}
    </div>
  );
};

const Consumer = ({ children }) => {
  const { map } = useContext(MapboxContext);

  return map && children;
};

MapboxContext.Provider = MapboxProvider;
MapboxContext.Map = Map;
MapboxContext.Consumer = Consumer;

export default MapboxContext;
