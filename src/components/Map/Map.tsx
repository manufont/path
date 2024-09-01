import { useContext, useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import UndoIcon from "@mui/icons-material/Undo";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useTheme } from "@mui/material/styles";

import { SearchBox, MapPath, PathDetails, Library } from "components";
import { LibraryContext, MapboxMap, MapboxProvider } from "contexts";
import { useSearchState, usePath, useTitle, useDidUpdateEffect, usePrevious } from "hooks";
import {
  lonLatEncoder,
  europeBounds,
  boundsCenter,
  boundsFromPoint,
  getWaypointsFromPath,
  pathEncoder,
  getBoundsFromPoints,
  addBoundsMargin,
  Encoder,
  Bounds,
  LonLat,
  pointsDiff,
} from "helpers/geo";
import { photonToString, getPhotonFromLocation, PhotonFeature } from "helpers/photon";

import mapboxLightStyle from "./mapboxStyle";
import { isDefined, rDeepSearch } from "helpers/methods";
import { darkenColor } from "helpers/color";
import { Path } from "hooks/usePath";
import BoundsMapping from "./BoundsMapping";
import { Style } from "maplibre-gl";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

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
    if (!location) return europeBounds;
    if (waypoints.length === 0) return boundsFromPoint(location);
    return addBoundsMargin(getBoundsFromPoints([location, ...waypoints]), 0.5);
  }, [location, waypoints]);

  const previousWaypoints = usePrevious(waypoints);
  const previousLocation = usePrevious(location);

  useEffect(() => {
    // If there's a big enough difference, we center on path bounds
    const prev = [previousLocation, ...(previousWaypoints || [])].filter(isDefined);
    const next = [location, ...waypoints].filter(isDefined);
    if (next.length > 1 && pointsDiff(prev, next) > 1) {
      setBounds(addBoundsMargin(getBoundsFromPoints(next), 0.5));
    }
  }, [location, previousLocation, previousWaypoints, waypoints]);

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
      style: theme.palette.mode === "dark" ? mapboxDarkStyle : mapboxLightStyle,
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

  const setLocationFromPoint = async (newLocation: LonLat | null) => {
    setLocation(newLocation);
    if (!newLocation) return;
    if (!location) {
      //we don't want to recenter if the location has already been set
      setBounds(boundsFromPoint(newLocation));
    }
    const photon = await getPhotonFromLocation(newLocation);
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
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    if (showSettings) {
      setShowLibrary(false);
    }
  }, [showSettings]);

  useEffect(() => {
    if (showLibrary) {
      setShowSettings(false);
    }
  }, [showLibrary]);

  const { storedPaths } = useContext(LibraryContext);

  useEffect(() => {
    if (storedPaths?.length === 0 && showLibrary) {
      setShowLibrary(false);
    }
  }, [showLibrary, storedPaths?.length]);

  return (
    <MapContainerDiv>
      <BoxesDiv>
        <Card>
          <StyledCardContent>
            <SearchBox
              defaultSearchText={locationText}
              mapCenter={boundsCenter(bounds)}
              onPlaceSelect={onPlaceSelect}
              setLocation={onSearchBoxLocationChange}
            />
          </StyledCardContent>
        </Card>
        {location && (
          <ExpandableCard>
            <HeaderDiv>
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
            </HeaderDiv>
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
          </ExpandableCard>
        )}

        {(path || storedPaths.length > 0) && (
          <Library path={path} showLibrary={showLibrary} setShowLibrary={setShowLibrary} />
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
      </BoxesDiv>
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
    </MapContainerDiv>
  );
};

const MapContainerDiv = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const StyledCardContent = styled(CardContent)`
  padding: 0px 12px 0px 12px;
  :last-child {
    padding-bottom: 4px;
  }
`;

const BoxesDiv = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  width: 360px;
  z-index: 1;

  @media screen and (max-width: 640px) {
    position: initial;
    width: 100%;
    border-radius: unset;
  }
`;

const ExpandableCard = styled(Card)`
  margin-top: 16px;
  overflow: visible;

  @media screen and (max-width: 640px) {
    margin-top: -6px;
  }
`;

const HeaderDiv = styled.div`
  display: flex;
  align-items: start;
  margin: 0px 12px;
  padding-top: 8px;

  > *:first-of-type {
    flex: 1;
  }
  @media screen and (max-width: 640px) {
    padding-top: 0px;
  }
`;

export default Map;
