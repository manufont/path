export const boundsCmp = (boundsA, boundsB) =>
  boundsA[0][0] === boundsB[0][0] &&
  boundsA[0][1] === boundsB[0][1] &&
  boundsA[1][0] === boundsB[1][0] &&
  boundsA[1][1] === boundsB[1][1];

export const boundsEncoder = {
  encode: (bounds) =>
    bounds.map((point) => point.map((_) => Math.round(_ * 1e5)).join(".")).join("~"),
  decode: (encodedBounds) =>
    encodedBounds
      .split("~")
      .map((encodedPoint) => encodedPoint.split(".").map((_) => parseInt(_) / 1e5)),
};
