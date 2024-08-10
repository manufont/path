import polyline from "@mapbox/polyline";

import { minBy, avg, last } from "./methods";
import { Path } from "hooks/usePath";

const PATH_PRECISION = Number(process.env.REACT_APP_PATH_PRECISION);
const PRECISION_10 = Math.pow(10, PATH_PRECISION);

export type LonLat = [lon: number, lat: number];

export type Bounds = [southWest: LonLat, northEast: LonLat];

export type Encoder<T> = {
  encode: (value: T) => string | undefined;
  decode: (str: string) => T;
};

export const toPrecision = (n: number) => Math.round(n * PRECISION_10) / PRECISION_10;

export const lonLatCmp = (lonLatA: LonLat, lonLatB: LonLat) =>
  lonLatA[0] === lonLatB[0] && lonLatA[1] === lonLatB[1];

export const boundsCmp = (boundsA: Bounds, boundsB: Bounds) =>
  lonLatCmp(boundsA[0], boundsB[0]) && lonLatCmp(boundsA[1], boundsB[1]);

export const lonLatEncoder: Encoder<LonLat | null> = {
  encode: (lonLat) => {
    if (lonLat === null) return undefined;
    return lonLat.map((_) => Math.round(_ * PRECISION_10)).join(".");
  },
  decode: (str) => {
    if (str === "") return null;
    return str.split(".").map((_) => parseInt(_) / PRECISION_10) as LonLat;
  },
};

export const boundsEncoder: Encoder<Bounds> = {
  encode: (bounds) => bounds.map(lonLatEncoder.encode).join("~"),
  decode: (encodedBounds) => encodedBounds.split("~").map(lonLatEncoder.decode) as Bounds,
};

export const franceBounds: Bounds = [
  [-5.5591, 41.31433],
  [9.6625, 51.1242],
];

export const distance = (pointA: LonLat, pointB: LonLat) => {
  const [lonA, latA] = pointA;
  const [lonB, latB] = pointB;
  return Math.sqrt(Math.pow(lonA - lonB, 2) + Math.pow(latA - latB, 2));
};

export const closestPoint = (polyline: LonLat[], point: LonLat) =>
  minBy(polyline, (_: LonLat) => distance(_, point));

export const pointsCmp = (pointsA: LonLat[], pointsB: LonLat[]) => {
  if (pointsA.length !== pointsB.length) return false;
  for (let i = 0; i < pointsA.length; ++i) {
    if (!lonLatCmp(pointsA[i], pointsB[i])) return false;
  }
  return true;
};

export const boundsFromPoint = (point: LonLat): Bounds => {
  const delta = 0.01;
  return [
    [point[0] - delta, point[1] - delta],
    [point[0] + delta, point[1] + delta],
  ];
};

export const boundsCenter = (bounds: Bounds): LonLat => [
  avg([bounds[0][0], bounds[1][0]]),
  avg([bounds[0][1], bounds[1][1]]),
];

export const getBoundsFromPoints = (points: LonLat[]): Bounds => {
  const [first, ...rest] = points;
  const min = first.slice() as LonLat;
  const max = first.slice() as LonLat;
  if (rest) {
    rest.forEach(([lng, lat]) => {
      if (lng < min[0]) min[0] = lng;
      if (lng > max[0]) max[0] = lng;
      if (lat < min[1]) min[1] = lat;
      if (lat > max[1]) max[1] = lat;
    });
  }
  return [min, max];
};

export const addBoundsMargin = (bounds: Bounds, relativeMargin: number): Bounds => {
  const [southWest, northEast] = bounds;
  const [minLon, minLat] = southWest;
  const [maxLon, maxLat] = northEast;
  const lonMargin = (maxLon - minLon) * relativeMargin;
  const latMargin = (maxLat - minLat) * relativeMargin;
  return [
    [minLon - lonMargin, minLat - latMargin],
    [maxLon + lonMargin, maxLat + latMargin],
  ];
};

const pEncode = (points: LonLat[]) => polyline.encode(points, PATH_PRECISION);
const pDecode = (str: string): LonLat[] => polyline.decode(str, PATH_PRECISION);

const uriBtoa = (str: string) =>
  btoa(str).replace(/=/g, "~").replace(/\//g, ".").replace(/\+/g, "-");
const uriAtob = (str: string) =>
  atob(str.replace(/~/g, " ").replace(/\./g, "/").replace(/-/g, "+"));
const uriAtobOld = (str: string) => atob(str.replace(/~/g, " ").replace(/\./g, "/"));

export const pathEncoder: Encoder<LonLat[]> = {
  encode: (path) => uriBtoa(pEncode(path)),
  decode: (str) => {
    try {
      return pDecode(uriAtob(str));
    } catch (e) {
      console.warn("Couldn't decode path. Trying fallback mode 1...");
    }
    try {
      return pDecode(uriAtobOld(str));
    } catch (e) {
      console.warn("Couldn't decode path. Trying fallback mode 2...");
    }
    return pDecode(uriAtobOld(str.replace(/ /g, "+")));
  },
};

export const getWaypointsFromPath = (path: Pick<Path, "trip">) =>
  pDecode(
    pEncode(
      path.trip.legs
        .map((leg) => last(leg.decodedShape))
        .slice(0, path.trip.oneWayMode ? undefined : -1)
    )
  );
