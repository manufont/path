import { isDefined, maxBy, minBy } from "helpers/methods";
import { Path } from "hooks/usePath";
import simplify from "simplify-js";

type Point = {
  x: number;
  y: number;
};

const normalizePoints = (points: Point[]): Point[] => {
  //normalize and center a simplified polyline in a 0,0,1,1 viewport
  const minX = minBy(points, (point) => point.x)?.x;
  const minY = minBy(points, (point) => point.y)?.y;
  const maxX = maxBy(points, (point) => point.x)?.x;
  const maxY = maxBy(points, (point) => point.y)?.y;
  if (!(isDefined(minX) && isDefined(minY) && isDefined(maxX) && isDefined(maxY)))
    throw Error("No svg path");
  const avgY = (maxY + minY) / 2;
  // mercator and all this stuff...
  // 1.5 should be at 0°, +inf at 90°, 1 at the equator
  // See this as a quick&dirty projection
  const latitudeCompensation = 1 + Math.abs(Math.tan(((Math.PI / 2) * avgY) / 90)) / 2;
  const size = {
    x: maxX - minX,
    y: maxY - minY,
  };
  const maxSize = Math.max(size.x, size.y * latitudeCompensation);
  const sideMargin = {
    x: (maxSize - size.x) / 2,
    y: (maxSize - size.y * latitudeCompensation) / 2,
  };
  const simplifiedPoints = simplify(points, Math.max(size.x, size.y) / 200);
  return simplifiedPoints.map(({ x, y }) => ({
    x: (sideMargin.x + x - minX) / maxSize,
    y: ((maxY - y) * latitudeCompensation + sideMargin.y) / maxSize,
  }));
};

export const getSvgPath = (path: Path) => {
  const allPoints = path.trip.legs.flatMap((leg) => leg.decodedShape).map(([x, y]) => ({ x, y }));
  const normalizedPoints = normalizePoints(allPoints);
  return normalizedPoints.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
};
