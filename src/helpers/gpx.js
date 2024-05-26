import { buildGPX, GarminBuilder } from "gpx-builder";
import { saveAs } from "file-saver";

const { Point } = GarminBuilder.MODELS;

const generateGPX = (path) => {
  const points = path.trip.legs
    .flatMap((leg, index) => leg.decodedShape.slice(index && 1))
    .map(([lng, lat]) => new Point(lat, lng));
  const gpxData = new GarminBuilder();
  gpxData.setSegmentPoints(points);
  return buildGPX(gpxData.toObject());
};

export const downloadGPX = (path, name) => {
  const gpxText = generateGPX(path);
  const blob = new Blob([gpxText], { type: "application/gpx+xml;charset=utf-8" });
  saveAs(blob, `${name}.gpx`);
};
