import polyline from "@mapbox/polyline";

import { minBy, avg, first } from "./methods";

const PATH_PRECISION = parseInt(process.env.REACT_APP_PATH_PRECISION);
const PRECISION_10 = Math.pow(10, PATH_PRECISION);

export const toPrecision = (n) => Math.round(n * PRECISION_10) / PRECISION_10;

export const latLngCmp = (latLngA, latLngB) =>
  latLngA[0] === latLngB[0] && latLngA[1] === latLngB[1];

export const boundsCmp = (boundsA, boundsB) =>
  latLngCmp(boundsA[0], boundsB[0]) && latLngCmp(boundsA[1], boundsB[1]);

export const latLngEncoder = {
  encode: (latLng) => {
    if (latLng === null) return undefined;
    return latLng.map((_) => Math.round(_ * PRECISION_10)).join(".");
  },
  decode: (str) => {
    if (str === "") return null;
    return str.split(".").map((_) => parseInt(_) / PRECISION_10);
  },
};

export const boundsEncoder = {
  encode: (bounds) => bounds.map(latLngEncoder.encode).join("~"),
  decode: (encodedBounds) => encodedBounds.split("~").map(latLngEncoder.decode),
};

export const franceBounds = [
  [-5.5591, 41.31433],
  [9.6625, 51.1242],
];

export const distance = (pointA, pointB) => {
  const [lonA, latA] = pointA;
  const [lonB, latB] = pointB;
  return Math.sqrt(Math.pow(lonA - lonB, 2) + Math.pow(latA - latB, 2));
};

export const closestPoint = (polyline, point) => minBy(polyline, (_) => distance(_, point));

export const pointsCmp = (pointsA, pointsB) => {
  if (pointsA.length !== pointsB.length) return false;
  for (let i = 0; i < pointsA.length; ++i) {
    if (!latLngCmp(pointsA[i], pointsB[i])) return false;
  }
  return true;
};

export const boundsFromPoint = (point) => {
  const delta = 0.01;
  return [
    [point[0] - delta, point[1] - delta],
    [point[0] + delta, point[1] + delta],
  ];
};

export const boundsCenter = (bounds) => [
  avg([bounds[0][0], bounds[1][0]]),
  avg([bounds[0][1], bounds[1][1]]),
];

const pEncode = (points) => polyline.encode(points, PATH_PRECISION);
const pDecode = (str) => polyline.decode(str, PATH_PRECISION);

const uriBtoa = (str) => btoa(str).replace(/=/g, "~").replace(/\//g, ".");
const uriAtob = (str) => atob(str.replace(/~/g, " ").replace(/\./g, "/"));

export const pathEncoder = {
  encode: (path) => uriBtoa(pEncode(path)),
  decode: (str) => pDecode(uriAtob(str)),
};

export const getWaypointsFromPath = (path) =>
  pDecode(pEncode(path.trip.legs.map((leg) => first(leg.decodedShape)).slice(1)));
