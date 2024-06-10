import { useMemo } from "react";
import polyline from "@mapbox/polyline";

import useResource, { addCacheEntry } from "./useResource";
import { LonLat, getWaypointsFromPath } from "helpers/geo";

const VALHALLA_URL = process.env.REACT_APP_VALHALLA_URL;

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
  trip: {
    summary: {
      length: number;
      time: number;
    };
    legs: {
      shape: string;
      decodedShape: LonLat[];
    }[];
  };
};

export type PathOptions = {
  speed: number;
  mode: "running" | "cycling";
  useRoads: number;
  avoidBadSurfaces: number;
};

const parsePathResults = (results: ValhallaResponse): Path | null => {
  if (!results.trip) return null;
  return {
    ...results,
    trip: {
      ...results.trip,
      legs: results.trip.legs.map((leg) => ({
        ...leg,
        decodedShape: polyline.decode(leg.shape, 6).map(([lat, lng]) => [lng, lat]),
      })),
    },
  };
};

const getPathUrl = (startPoint: LonLat | null, waypoints: LonLat[], options: PathOptions) => {
  if (waypoints.length === 0 || startPoint === null) return null;
  const { speed, mode, useRoads, avoidBadSurfaces } = options;
  const params = {
    costing: mode === "running" ? "pedestrian" : "bicycle",
    locations: [startPoint, ...waypoints, startPoint].map((point) => ({
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
    if (!results) return null;
    const path = parsePathResults(results);
    if (path) {
      const correctedWaypoints = getWaypointsFromPath(path);
      const pathUrl = getPathUrl(startPoint, correctedWaypoints, options);
      if (pathUrl !== null) {
        addCacheEntry(pathUrl, results);
      }
    }
    return path;
  }, [results, startPoint, options]);

  return [path, loading, error] as const;
};

export default usePath;
