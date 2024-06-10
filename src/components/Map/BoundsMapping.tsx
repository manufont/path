import { MapboxContext } from "contexts";
import { Bounds, boundsCmp, toPrecision } from "helpers/geo";
import { useContext, useEffect } from "react";

type BoundsMappingProps = {
  bounds: Bounds;
  setBounds: (bounds: Bounds) => void;
};

const BoundsMapping = ({ bounds, setBounds }: BoundsMappingProps) => {
  const { map } = useContext(MapboxContext);

  // url -> map binding
  useEffect(() => {
    if (!map) return;
    const mapBounds = map
      .getBounds()
      .toArray()
      .map((_) => _.map(toPrecision)) as Bounds;
    if (!boundsCmp(mapBounds, bounds)) {
      map.fitBounds(bounds, {
        maxDuration: 2500, // 2.5 seconds
      });
    }
  }, [map, bounds]);

  // map -> url binding
  useEffect(() => {
    if (!map) return;
    const onMoveEnd = () => {
      const mapBounds = map
        .getBounds()
        .toArray()
        .map((_) => _.map(toPrecision)) as Bounds;
      if (!boundsCmp(mapBounds, bounds)) {
        setBounds(mapBounds);
      }
    };
    map.on("moveend", onMoveEnd);
    return () => {
      map.off("moveend", onMoveEnd);
    };
  }, [map, bounds, setBounds]);

  return null;
};

export default BoundsMapping;
