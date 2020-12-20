import React, { useEffect, useContext, useMemo, useState } from "react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import UndoIcon from "@material-ui/icons/Undo";
import DirectionsRunIcon from "@material-ui/icons/DirectionsRun";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

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
  getWaypointsFromPath,
  pathEncoder,
  toPrecision,
} from "helpers/geo";
import { photonToString, getPhotonFromLocation } from "helpers/photon";

import mapboxStyle from "./mapboxStyle";
import styles from "./Map.module.css";

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

  // url -> map binding
  useEffect(() => {
    const mapBounds = map
      .getBounds()
      .toArray()
      .map((_) => _.map(toPrecision));
    if (!boundsCmp(mapBounds, bounds)) {
      map.fitBounds(bounds, {
        maxDuration: 2500, // 2.5 seconds
      });
    }
  }, [map, bounds]);

  // map -> url binding
  useEffect(() => {
    const onMoveEnd = () => {
      const mapBounds = map
        .getBounds()
        .toArray()
        .map((_) => _.map(toPrecision));
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
  const [mode, setMode] = useSearchState("m", "running");
  const [speed, setSpeed] = useSearchState("s", mode === "running" ? 10 : 25, numberEncoder);
  const pathOptions = useMemo(() => ({
    mode, speed
  }), [mode, speed])
  const [path, pathLoading, pathError] = usePath(location, waypoints, pathOptions);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    setSnackbarOpen(Boolean(pathError));
  }, [pathError]);

  useTitle(getTitle(path, locationText));

  useEffect(() => {
    if (!path) return;
    setWaypoints(getWaypointsFromPath(path));
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
        <Card>
          <CardContent className={styles.cardContent}>
            <SearchBox
              defaultSearchText={locationText}
              mapCenter={boundsCenter(bounds)}
              onPlaceSelect={onPlaceSelect}
              setLocation={setLocationFromPoint}
            />
          </CardContent>
          <Tabs value={mode} onChange={(e, _) => setMode(_)} centered textColor="primary">
            <Tab wrapped icon={<DirectionsRunIcon />} value="running" />
            <Tab wrapped icon={<DirectionsBikeIcon />} value="cycling" />
          </Tabs>
          {location && (
            <PathDetails
              mode={mode}
              path={path}
              pathLoading={pathLoading}
              speed={speed}
              setSpeed={setSpeed}
              setWaypoints={setWaypoints}
            />
          )}
        </Card>

        <Snackbar open={snackbarOpen}>
          <Alert
            variant="filled"
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  setSnackbarOpen(false);
                  window.history.back();
                }}
              >
                <UndoIcon />
              </IconButton>
            }
            severity="error"
          >
            Cannot build path
          </Alert>
        </Snackbar>
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
