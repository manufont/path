import React from "react";
import "mapbox-gl/dist/mapbox-gl.css";
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
