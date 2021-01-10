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
import { useTheme } from "@material-ui/core/styles";
import Color from "color";

import { SearchBox, MapPath, PathDetails } from "components";
import { Mapbox } from "contexts";
import { useSearchState, usePath, useTitle, useDidUpdateEffect } from "hooks";
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

import mapboxLightStyle from "./mapboxStyle";
import styles from "./Map.module.css";

const DEFAULT_USE_ROADS = 0.5;
const DEFAULT_AVOID_BAD_SURFACES = 0.25;
const DEFAULT_RUNNING_SPEED = 10;
const DEFAULT_CYCLING_SPEED = 25;

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

// we use a pow < 1 in order to prevent contrast to crunch between dark colors
const darkenLuminosity = (l) => {
  return Math.round(100 * Math.pow(1 - l / 100, 0.9));
};

const darkenHsl = (elt, index) => {
  const [h, s, l, ...rest] = elt.split(",");
  const [value, ...valueRest] = l.split("%");
  const newValue = darkenLuminosity(parseInt(value));
  const newL = [newValue, ...valueRest].join("%");
  return [h, s, newL, ...rest].join(",");
};

const rDeepSearch = (elt, lambda) => {
  if (Array.isArray(elt)) {
    return elt.map((_) => rDeepSearch(_, lambda));
  } else if (elt === Object(elt)) {
    return Object.entries(elt).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: rDeepSearch(value, lambda),
      }),
      {}
    );
  }
  return lambda(elt);
};

const colorStartKeys = ["rgb(", "rgba(", "#", "hsl(", "hsla("];
const mapboxDarkStyle = rDeepSearch(mapboxLightStyle, (value) => {
  const strValue = String(value);
  if (!colorStartKeys.some((_) => strValue.startsWith(_))) return value;
  const color = Color(value);
  return darkenHsl(color.hsl().string());
});

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
  const defaultSpeed = mode === "running" ? DEFAULT_RUNNING_SPEED : DEFAULT_CYCLING_SPEED;
  const [speed, setSpeed] = useSearchState("s", defaultSpeed, numberEncoder);
  const [useRoads, setUseRoads] = useSearchState("ur", DEFAULT_USE_ROADS, numberEncoder);
  const [avoidBadSurfaces, setAvoidBadSurfaces] = useSearchState(
    "abs",
    DEFAULT_AVOID_BAD_SURFACES,
    numberEncoder
  );
  const pathOptions = useMemo(
    () => ({
      mode,
      speed,
      useRoads,
      avoidBadSurfaces,
    }),
    [mode, speed, useRoads, avoidBadSurfaces]
  );
  const [path, pathLoading, pathError] = usePath(location, waypoints, pathOptions);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();

  useDidUpdateEffect(() => {
    if (mode === "running") {
      setUseRoads(DEFAULT_USE_ROADS);
      setAvoidBadSurfaces(DEFAULT_AVOID_BAD_SURFACES);
    }
  }, [mode, setUseRoads, setAvoidBadSurfaces]);

  useDidUpdateEffect(() => {
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
      style: theme.palette.type === "dark" ? mapboxDarkStyle : mapboxLightStyle,
      bounds,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
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
          {location && (
            <>
              <Tabs value={mode} onChange={(e, _) => setMode(_, true)} centered textColor="primary">
                <Tab wrapped icon={<DirectionsRunIcon />} value="running" />
                <Tab wrapped icon={<DirectionsBikeIcon />} value="cycling" />
              </Tabs>
              <PathDetails
                mode={mode}
                path={path}
                pathLoading={pathLoading}
                speed={speed}
                setSpeed={setSpeed}
                useRoads={useRoads}
                setUseRoads={setUseRoads}
                avoidBadSurfaces={avoidBadSurfaces}
                setAvoidBadSurfaces={setAvoidBadSurfaces}
                setWaypoints={setWaypoints}
              />
            </>
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
