import { useMemo } from "react";
import polyline from "@mapbox/polyline";
import { md5 } from "js-md5";

import useResource, { addCacheEntry } from "./useResource";
import { LonLat, getWaypointsFromPath, lonLatCmp } from "helpers/geo";
import { first, last } from "helpers/methods";

const VALHALLA_URL = process.env.REACT_APP_VALHALLA_URL;

export const getPathId = (path: Path) => {
  return md5(path.pathUrl);
};

export type ValhallaResponse = {
  trip: {
    summary: {
      length: number;
      time: number;
    };
    legs: {
      shape: string;
    }[];
  };
};

export type Path = {
  id: string;
  trip: {
    summary: {
      length: number;
      time: number;
    };
    legs: {
      shape: string;
      decodedShape: LonLat[];
    }[];
    oneWayMode: boolean;
  };
  pathUrl: string;
  startPoint: LonLat;
  options: PathOptions;
};

export type PathOptions = {
  speed: number;
  mode: "running" | "cycling";
  useRoads: number;
  avoidBadSurfaces: number;
  oneWayMode: boolean;
};

const isOneWay = (legs: Path["trip"]["legs"]) => {
  const start = first(first(legs).decodedShape);
  const end = last(last(legs).decodedShape);
  return !lonLatCmp(start, end);
};

const parsePathResults = (
  results: ValhallaResponse,
  startPoint: LonLat,
  options: PathOptions
): Path | null => {
  if (!results.trip) return null;

  const legs = results.trip.legs.map((leg) => ({
    ...leg,
    decodedShape: polyline.decode(leg.shape, 6).map(([lat, lng]) => [lng, lat] as LonLat),
  }));
  const path = {
    ...results,
    trip: {
      ...results.trip,
      legs,
      oneWayMode: isOneWay(legs),
    },
  };

  const correctedWaypoints = getWaypointsFromPath(path);
  const pathUrl = getPathUrl(startPoint, correctedWaypoints, options);
  if (!pathUrl) throw Error("Path has no URL");

  return {
    ...path,
    id: md5(pathUrl),
    pathUrl,
    startPoint,
    options,
  };
};

const getPathUrl = (startPoint: LonLat | null, waypoints: LonLat[], options: PathOptions) => {
  if (waypoints.length === 0 || startPoint === null) return null;
  const { speed, mode, useRoads, avoidBadSurfaces, oneWayMode } = options;
  const allPoints = [startPoint, ...waypoints];
  if (!oneWayMode) {
    allPoints.push(startPoint);
  }
  const params = {
    costing: mode === "running" ? "pedestrian" : "bicycle",
    locations: allPoints.map((point) => ({
      lon: point[0],
      lat: point[1],
      options: { allowUTurn: true },
    })),
    costing_options: {
      ...(mode === "running" && {
        pedestrian: {
          walking_speed: speed,
        },
      }),
      ...(mode === "cycling" && {
        bicycle: {
          cycling_speed: speed,
          bicycle_type: "Road",
          use_roads: useRoads,
          avoid_bad_surfaces: avoidBadSurfaces,
        },
      }),
    },
  };
  return `${VALHALLA_URL}/route?json=${JSON.stringify(params)}`;
};

const usePath = (startPoint: LonLat | null, waypoints: LonLat[], options: PathOptions) => {
  const url = getPathUrl(startPoint, waypoints, options);
  const [results, loading, error] = useResource<ValhallaResponse>(url);

  const path = useMemo(() => {
    if (!results || !startPoint) return null;
    const path = parsePathResults(results, startPoint, options);
    if (path) {
      if (path.pathUrl !== null) {
        addCacheEntry(path.pathUrl, results);
      }
    }
    return path;
  }, [results, startPoint, options]);

  return [path, loading, error] as const;
};

export default usePath;
