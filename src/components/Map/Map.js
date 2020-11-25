import React, { useEffect, useContext, useMemo } from "react";
import polyline from "@mapbox/polyline";
import lzString from "lz-string";

import { SearchBox, MapPath } from "components";
import { Mapbox } from "contexts";
import { useSearchState, usePath } from "hooks";
import { boundsEncoder, latLngEncoder, boundsCmp, franceBounds } from "helpers/geo";
import { first } from "helpers/methods";

import styles from "./Map.module.css";

window.polyline = polyline;

const MAPBOX_STYLE = process.env.REACT_APP_MAPBOX_STYLE;

const PATH_PRECISION = 5;

window.lzString = lzString;

const uriBtoa = (str) => btoa(str).replace(/=/g, "~").replace(/\//g, ".");
const uriAtob = (str) => atob(str.replace(/~/g, " ").replace(/\./g, "/"));

const pathEncoder = {
  encode: (path) => uriBtoa(polyline.encode(path, PATH_PRECISION)),
  decode: (str) => polyline.decode(uriAtob(str), PATH_PRECISION),
};

const defaultPath = [];

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
  const [waypoints, setWaypoints] = useSearchState("p", defaultPath, pathEncoder);
  const [path] = usePath(location, waypoints);

  useEffect(() => {
    if (!path) return;
    const correctedWaypoints = path.trip.legs.map((leg) => first(leg.decodedShape)).slice(1);
    setWaypoints(correctedWaypoints);
  }, [path, setWaypoints]);

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
            setLocation(newLocation, true);
            setWaypoints([]);
            setBounds(newBounds);
          }}
        />
      </div>
      <Mapbox.Provider options={mapOptions} style={{ flex: 1 }}>
        <BoundsMapping bounds={bounds} setBounds={setBounds} />
        {location && (
          <MapPath
            location={location}
            setLocation={setLocation}
            waypoints={waypoints}
            setWaypoints={setWaypoints}
            path={path}
          />
        )}
      </Mapbox.Provider>
    </div>
  );
};

export default Map;
