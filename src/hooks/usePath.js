import { useMemo } from "react";
import polyline from "@mapbox/polyline";

import { first } from "helpers/methods";
import useResource, { addCacheEntry } from "./useResource";

const parsePathResults = (results) => ({
  ...results,
  trip: {
    ...results.trip,
    legs: results.trip.legs.map((leg) => ({
      ...leg,
      decodedShape: polyline.decode(leg.shape, 6).map(([lat, lng]) => [lng, lat]),
    })),
  },
});

const getPathUrl = (startPoint, waypoints) => {
  if (waypoints.length === 0) return null;
  const params = {
    costing: "pedestrian",
    locations: [startPoint, ...waypoints, startPoint].map((point) => ({
      lon: point[0],
      lat: point[1],
      options: { allowUTurn: true },
    })),
  };
  return `/valhalla/route?json=${JSON.stringify(params)}`;
};

const getWaypointsFromPath = (path) =>
  path.trip.legs.map((leg) => first(leg.decodedShape)).slice(1);

const usePath = (startPoint, waypoints) => {
  const url = getPathUrl(startPoint, waypoints);
  const [results, loading] = useResource(url);

  const path = useMemo(() => {
    if (!results) return null;
    const path = parsePathResults(results);
    if (path) {
      const correctedWaypoints = getWaypointsFromPath(path);
      addCacheEntry(getPathUrl(startPoint, correctedWaypoints), results);
    }
    return path;
  }, [results, startPoint]);

  return [path, loading];
};

export default usePath;
