import React, { useEffect, useContext, useMemo } from "react";
import polyline from "@mapbox/polyline";

import { SearchBox, MapPath, PathDetails } from "components";
import { Mapbox } from "contexts";
import { useSearchState, usePath, useTitle } from "hooks";
import {
  boundsEncoder,
  latLngEncoder,
  boundsCmp,
  franceBounds,
  boundsCenter,
  boundsFromPoint,
} from "helpers/geo";
import { first } from "helpers/methods";
import { photonToString, getPhotonFromLocation } from "helpers/photon";

import mapboxStyle from "./mapboxStyle";
import styles from "./Map.module.css";

const PATH_PRECISION = 6;

const uriBtoa = (str) => btoa(str).replace(/=/g, "~").replace(/\//g, ".");
const uriAtob = (str) => atob(str.replace(/~/g, " ").replace(/\./g, "/"));

const pathEncoder = {
  encode: (path) => uriBtoa(polyline.encode(path, PATH_PRECISION)),
  decode: (str) => polyline.decode(uriAtob(str), PATH_PRECISION),
};

const numberEncoder = {
  encode: (nb) => String(nb),
  decode: (str) => parseFloat(str),
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

const getTitle = (path, locationText) => {
  if (!locationText) {
    return "ManuPath";
  }
  if (!path) {
    return `${locationText} - ManuPath`;
  }
  const distanceText = path.trip.summary.length.toFixed(1) + " km";
  return `${distanceText} near ${locationText} - ManuPath`;
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
  const [locationText, setLocationText] = useSearchState("q", "");
  const [speed, setSpeed] = useSearchState("s", 10, numberEncoder);
  const [path, pathLoading] = usePath(location, waypoints, speed);

  useTitle(getTitle(path, locationText));

  useEffect(() => {
    if (!path) return;
    const correctedWaypoints = path.trip.legs.map((leg) => first(leg.decodedShape)).slice(1);
    setWaypoints(correctedWaypoints);
  }, [path, setWaypoints]);

  const mapOptions = useMemo(
    () => ({
      width: "100%",
      style: mapboxStyle,
      bounds,
      pitchWithRotate: false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onPlaceSelect = (place) => {
    if (!place) return;
    const newLocation = place.geometry.coordinates;
    let newBounds = lngLatToBounds(newLocation);
    if (place.properties.extent) {
      newBounds = getBoundsFromPlace(place);
    }
    setLocationText(photonToString(place));
    setLocation(newLocation, true);
    setWaypoints([]);
    setBounds(newBounds);
  };

  const setLocationFromPoint = async (location) => {
    setLocation(location);
    setBounds(boundsFromPoint(location));
    const photon = await getPhotonFromLocation(location);
    if (photon) {
      setLocationText(photonToString(photon));
    }
  };

  return (
    <div className={styles.mapContainer}>
      <div className={styles.searchBox}>
        <SearchBox
          defaultSearchText={locationText}
          mapCenter={boundsCenter(bounds)}
          onPlaceSelect={onPlaceSelect}
          setLocation={setLocationFromPoint}
        />
        {location && (
          <PathDetails
            path={path}
            pathLoading={pathLoading}
            speed={speed}
            setSpeed={setSpeed}
            setWaypoints={setWaypoints}
          />
        )}
      </div>
      <Mapbox.Provider options={mapOptions} style={{ flex: 1 }}>
        <BoundsMapping bounds={bounds} setBounds={setBounds} />
        <MapPath
          location={location}
          setLocation={setLocationFromPoint}
          waypoints={waypoints}
          setWaypoints={setWaypoints}
          path={path}
        />
      </Mapbox.Provider>
    </div>
  );
};

export default Map;
