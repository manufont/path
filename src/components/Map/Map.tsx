import { useEffect, useMemo, useState } from "react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import UndoIcon from "@material-ui/icons/Undo";
import DirectionsRunIcon from "@material-ui/icons/DirectionsRun";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import TrendingFlatIcon from "@material-ui/icons/TrendingFlat";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { useTheme } from "@material-ui/core/styles";

import { SearchBox, MapPath, PathDetails } from "components";
import { MapboxMap, MapboxProvider } from "contexts";
import { useSearchState, usePath, useTitle, useDidUpdateEffect } from "hooks";
import {
  lonLatEncoder,
  franceBounds,
  boundsCenter,
  boundsFromPoint,
  getWaypointsFromPath,
  pathEncoder,
  getBoundsFromPoints,
  addBoundsMargin,
  Encoder,
  Bounds,
  LonLat,
} from "helpers/geo";
import { photonToString, getPhotonFromLocation, PhotonFeature } from "helpers/photon";

import mapboxLightStyle from "./mapboxStyle";
import styles from "./Map.module.css";
import { rDeepSearch } from "helpers/methods";
import { darkenColor } from "helpers/color";
import { Path } from "hooks/usePath";
import BoundsMapping from "./BoundsMapping";
import { Style } from "mapbox-gl";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";

const DEFAULT_USE_ROADS = 0.5;
const DEFAULT_AVOID_BAD_SURFACES = 0.25;
const DEFAULT_RUNNING_SPEED = 10;
const DEFAULT_CYCLING_SPEED = 25;

const numberEncoder: Encoder<number> = {
  encode: (nb) => String(nb),
  decode: (str) => parseFloat(str),
};

const booleanEncoder: Encoder<boolean> = {
  encode: (bool) => (bool ? "1" : undefined),
  decode: (str) => Boolean(str),
};

const defaultPath: LonLat[] = [];

const getBoundsFromPlace = (place: PhotonFeature): Bounds => {
  const [minLon, maxLat, maxLon, minLat] = place.properties.extent;
  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
};

const lngLatToBounds = (lonLat: LonLat): Bounds => {
  const latE = 0.005;
  const lngE = 0.005;
  const [lng, lat] = lonLat;
  return [
    [lng - lngE, lat - latE],
    [lng + lngE, lat + latE],
  ];
};

const getTitle = (path: Path | null, locationText: string | null) => {
  if (!locationText) {
    return "ManuPath";
  }
  if (!path) {
    return `${locationText} - ManuPath`;
  }
  const distanceText = path.trip.summary.length.toFixed(1) + " km";
  return `${distanceText} near ${locationText} - ManuPath`;
};

const colorStartKeys = ["rgb(", "rgba(", "#", "hsl(", "hsla("];
const mapboxDarkStyle = rDeepSearch(mapboxLightStyle, (value) => {
  const strValue = String(value);
  if (!colorStartKeys.some((_) => strValue.startsWith(_))) return value;
  return darkenColor(value);
}) as Style;

const Map = () => {
  const [oneWayMode, setOneWayMode] = useSearchState("o", false, booleanEncoder);
  const [location, setLocation] = useSearchState("l", null, lonLatEncoder);
  const [waypoints, setWaypoints] = useSearchState("p", defaultPath, pathEncoder);
  const [locationText, setLocationText] = useSearchState("q", "");
  const [mode, setMode] = useSearchState<"running" | "cycling">("m", "running");
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
      oneWayMode,
    }),
    [mode, speed, useRoads, avoidBadSurfaces, oneWayMode]
  );
  const [path, pathLoading, pathError] = usePath(location, waypoints, pathOptions);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();

  const defaultBounds = useMemo(() => {
    if (!location) return franceBounds;
    if (waypoints.length === 0) return boundsFromPoint(location);
    return addBoundsMargin(getBoundsFromPoints([location, ...waypoints]), 0.5);
  }, [location, waypoints]);

  const [bounds, setBounds] = useState<Bounds>(defaultBounds);

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

  const clearPath = () => {
    setWaypoints([]);
    setShowSettings(false);
  };

  const onPlaceSelect = (place: PhotonFeature) => {
    if (!place) return;
    const newLocation = place.geometry.coordinates;
    let newBounds = lngLatToBounds(newLocation);
    if (place.properties.extent) {
      newBounds = getBoundsFromPlace(place);
    }
    setLocationText(photonToString(place));
    setLocation(newLocation, true);
    clearPath();
    setBounds(newBounds);
  };

  const setLocationFromPoint = async (location: LonLat | null) => {
    setLocation(location);
    if (!location) return;
    setBounds(boundsFromPoint(location));
    const photon = await getPhotonFromLocation(location);
    if (photon) {
      setLocationText(photonToString(photon));
    }
  };

  const onSearchBoxLocationChange = async (location: LonLat | null) => {
    if (location === null) {
      clearPath();
    }
    setLocationFromPoint(location);
  };

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={styles.mapContainer}>
      <div className={styles.boxes}>
        <Card>
          <CardContent className={styles.cardContent}>
            <SearchBox
              defaultSearchText={locationText}
              mapCenter={boundsCenter(bounds)}
              onPlaceSelect={onPlaceSelect}
              setLocation={onSearchBoxLocationChange}
            />
          </CardContent>
        </Card>
        {location && (
          <Card className={styles.expandableBox}>
            <div className={styles.header}>
              <Tabs
                value={mode}
                onChange={(e, _) => setMode(_, true)}
                centered
                textColor="primary"
                variant="standard"
              >
                <Tab wrapped icon={<DirectionsRunIcon />} value="running" />
                <Tab wrapped icon={<DirectionsBikeIcon />} value="cycling" />
              </Tabs>
              <ToggleButtonGroup
                color="primary"
                size="small"
                value={oneWayMode ? "one-way" : "loop"}
                exclusive
                onChange={(e, value) => setOneWayMode(value === "one-way")}
                aria-label="Platform"
              >
                <ToggleButton value="loop">
                  <SyncAltIcon />
                </ToggleButton>
                <ToggleButton value="one-way">
                  <TrendingFlatIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
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
              clearPath={clearPath}
              showSettings={showSettings}
              setShowSettings={setShowSettings}
            />
          </Card>
        )}

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
      <MapboxProvider>
        <MapboxMap options={mapOptions} style={{ flex: 1 }}>
          <BoundsMapping bounds={bounds} setBounds={setBounds} />
          <MapPath
            location={location}
            setLocation={setLocationFromPoint}
            waypoints={waypoints}
            setWaypoints={setWaypoints}
            path={path}
          />
        </MapboxMap>
      </MapboxProvider>
    </div>
  );
};

export default Map;
