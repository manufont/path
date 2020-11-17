import React, { useEffect, useContext, useMemo } from "react";

import { SearchBox, PathFinder } from "components";
import { Mapbox } from "contexts";
import { useSearchState } from "hooks";
import { boundsEncoder, latLngEncoder, boundsCmp, franceBounds } from "helpers/geo";

import styles from "./Map.module.css";

const MAPBOX_STYLE = process.env.REACT_APP_MAPBOX_STYLE;

const getBoundsFromPlace = (place) => {
  const [minLon, maxLat, maxLon, minLat] = place.properties.extent;
  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
};

const lngLatToBounds = (lngLat) => {
  const latE = 0.005;
  const lngE = 0.005;
  const [lng, lat] = lngLat;
  return [
    [lng - lngE, lat - latE],
    [lng + lngE, lat + latE],
  ];
};

const BoundsMapping = ({ bounds, setBounds }) => {
  const map = useContext(Mapbox);

  // map -> url binding
  useEffect(() => {
    const mapBounds = map.getBounds().toArray();
    if (!boundsCmp(mapBounds, bounds)) {
      map.fitBounds(bounds, {
        maxDuration: 2500, // 2.5 seconds
      });
    }
    const onMoveEnd = () => {
      const mapBounds = map.getBounds().toArray();
      if (!boundsCmp(mapBounds, bounds)) {
        setBounds(mapBounds);
      }
    };
    map.on("moveend", onMoveEnd);
    return () => {
      map.off("moveend", onMoveEnd);
    };
  }, [map, bounds, setBounds]);

  return null;
};

const Map = () => {
  const [bounds, setBounds] = useSearchState("b", franceBounds, boundsEncoder);
  const [location, setLocation] = useSearchState("l", null, latLngEncoder);

  const mapOptions = useMemo(
    () => ({
      width: "100%",
      style: MAPBOX_STYLE,
      bounds,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className={styles.mapContainer}>
      <div className={styles.searchBox}>
        <SearchBox
          onPlaceSelect={(place) => {
            if (!place) return;
            const newLocation = place.geometry.coordinates;
            let newBounds = lngLatToBounds(newLocation);
            if (place.properties.extent) {
              newBounds = getBoundsFromPlace(place);
            }
            setLocation(newLocation);
            setBounds(newBounds);
          }}
        />
      </div>
      <Mapbox.Provider options={mapOptions} style={{ flex: 1 }}>
        <BoundsMapping bounds={bounds} setBounds={setBounds} />
        {location && <PathFinder location={location} setLocation={setLocation} />}
      </Mapbox.Provider>
    </div>
  );
};

export default Map;
