export const latLngCmp = (latLngA, latLngB) =>
  latLngA[0] === latLngB[0] && latLngA[1] === latLngB[1];

export const boundsCmp = (boundsA, boundsB) =>
  latLngCmp(boundsA[0], boundsB[0]) && latLngCmp(boundsA[1], boundsB[1]);

export const latLngEncoder = {
  encode: (latLng) => {
    if (latLng === null) return undefined;
    return latLng.map((_) => Math.round(_ * 1e5)).join(".");
  },
  decode: (str) => {
    if (str === "") return null;
    return str.split(".").map((_) => parseInt(_) / 1e5);
  },
};

export const boundsEncoder = {
  encode: (bounds) => bounds.map(latLngEncoder.encode).join("~"),
  decode: (encodedBounds) => encodedBounds.split("~").map(latLngEncoder.decode),
};

export const franceBounds = [
  [-5.5591, 41.31433],
  [9.662499, 51.1241999],
];
