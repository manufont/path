import React, { useCallback, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { EnhancedMap, MapState } from "./types";
import MapboxContext from "./context";
import enhanceMap from "./enhanceMap";

export const MapboxProvider = ({ children }: React.PropsWithChildren) => {
  const [mapState, setMapState] = useState<MapState | null>(null);
  const [map, setMap] = useState<EnhancedMap | null>(null);

  const registerMap = useCallback(
    (newMapState: MapState) => {
      if (!mapState) {
        setMapState(newMapState);
        return;
      }
      const savedContainer = mapState.container;
      const { container } = newMapState;
      if (savedContainer === container) return;
      const parentNode = container.parentNode;
      if (parentNode) {
        parentNode.removeChild(container);
        parentNode.appendChild(savedContainer);
      }
      if (map) {
        map.resize();
      }
    },
    [map, mapState]
  );

  useEffect(() => {
    if (mapState === null) return;
    const { container, options } = mapState;
    const mapboxMap = new mapboxgl.Map({
      ...options,
      container,
    });
    const onMapLoad = () => setMap(enhanceMap(mapboxMap));
    mapboxMap.on("load", onMapLoad);
    return () => {
      mapboxMap.off("load", onMapLoad);
    };
  }, [mapState]);

  return <MapboxContext.Provider value={{ map, registerMap }}>{children}</MapboxContext.Provider>;
};

export default MapboxProvider;
