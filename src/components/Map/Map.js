import React, { useEffect, useContext } from "react";

import { Mapbox } from "contexts";
import { useSearchState } from "hooks";
import { boundsEncoder, boundsCmp } from "helpers/bounds";

const MAPBOX_STYLE = process.env.REACT_APP_MAPBOX_STYLE;

const franceBounds = [
  [-5.5591, 41.31433],
  [9.662499, 51.1241999],
];

const BoundsMapping = ({ defaultBounds, setBounds }) => {
  const map = useContext(Mapbox);

  // map -> url binding
  useEffect(() => {
    const onMoveEnd = () => {
      const mapBounds = map.getBounds().toArray();
      if (!boundsCmp(mapBounds, defaultBounds)) {
        setBounds(mapBounds);
      }
    };
    map.on("moveend", onMoveEnd);
    return () => {
      map.off("moveend", onMoveEnd);
    };
  }, [map, defaultBounds, setBounds]);

  return null;
};

const Map = () => {
  const [defaultBounds, setBounds] = useSearchState("b", franceBounds, boundsEncoder, false);
  return (
    <Mapbox.Provider
      options={{
        width: "100%",
        style: MAPBOX_STYLE, // stylesheet location
        bounds: defaultBounds,
      }}
      style={{ flex: 1 }}
    >
      <BoundsMapping defaultBounds={defaultBounds} setBounds={setBounds} />
    </Mapbox.Provider>
  );
};

export default Map;
