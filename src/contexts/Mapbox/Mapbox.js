import React, { useCallback, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapboxContext = React.createContext();

const OriginalProvider = MapboxContext.Provider;

const enhanceMap = (map) => {
  map.onLayerClick = (layerId, onClick) => {
    map.on("mouseenter", layerId, function () {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, function () {
      map.getCanvas().style.cursor = "";
    });
    map.on("click", layerId, onClick);
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
      //map is cleared before unmount
      //setTimeout is needed to wait for child cleanup first
      setTimeout(() => mapboxMap.remove());
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
