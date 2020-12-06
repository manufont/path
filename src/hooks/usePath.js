import { useMemo } from "react";
import polyline from "@mapbox/polyline";

import { first } from "helpers/methods";
import useResource, { addCacheEntry } from "./useResource";

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

const getPathUrl = (startPoint, waypoints, speed) => {
  if (waypoints.length === 0) return null;
  const params = {
    costing: "pedestrian",
    locations: [startPoint, ...waypoints, startPoint].map((point) => ({
      lon: point[0],
      lat: point[1],
      options: { allowUTurn: true },
    })),
    costing_options: {
      pedestrian: {
        walking_speed: speed,
      },
    },
  };
  return `${VALHALLA_URL}/route?json=${JSON.stringify(params)}`;
};

const getWaypointsFromPath = (path) =>
  path.trip.legs.map((leg) => first(leg.decodedShape)).slice(1);

const usePath = (startPoint, waypoints, speed) => {
  const url = getPathUrl(startPoint, waypoints, speed);
  const [results, loading] = useResource(url);

  const path = useMemo(() => {
    if (!results) return null;
    const path = parsePathResults(results);
    if (path) {
      const correctedWaypoints = getWaypointsFromPath(path);
      addCacheEntry(getPathUrl(startPoint, correctedWaypoints, speed), results);
    }
    return path;
  }, [results, startPoint, speed]);

  return [path, loading];
};

export default usePath;
