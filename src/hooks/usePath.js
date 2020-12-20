import { useMemo } from "react";
import polyline from "@mapbox/polyline";

import useResource, { addCacheEntry } from "./useResource";
import { getWaypointsFromPath } from "helpers/geo";

const VALHALLA_URL = process.env.REACT_APP_VALHALLA_URL;

const parsePathResults = (results) => {
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

const getPathUrl = (startPoint, waypoints, options) => {
  if (waypoints.length === 0) return null;
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

const usePath = (startPoint, waypoints, options) => {
  const url = getPathUrl(startPoint, waypoints, options);
  const [results, loading, error] = useResource(url);

  const path = useMemo(() => {
    if (!results) return null;
    const path = parsePathResults(results);
    if (path) {
      const correctedWaypoints = getWaypointsFromPath(path);
      addCacheEntry(getPathUrl(startPoint, correctedWaypoints, options), results);
    }
    return path;
  }, [results, startPoint, options]);

  return [path, loading, error];
};

export default usePath;
