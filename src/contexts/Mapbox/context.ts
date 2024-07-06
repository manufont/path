import React from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { EnhancedMap, MapState } from "./types";

type MapboxContextType = {
  map: EnhancedMap | null;
  registerMap: (mapState: MapState) => void;
};

const MapboxContext = React.createContext<MapboxContextType>({
  map: null,
  registerMap: () => {},
});

export default MapboxContext;
