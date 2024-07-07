import { MapboxOptions } from "maplibre-gl";
import { useCallback, useContext } from "react";
import MapboxContext from "./context";
import { useDidUpdateEffect } from "hooks";

type MapProps = React.HTMLAttributes<HTMLDivElement> &
  React.PropsWithChildren<{
    options: Omit<MapboxOptions, "container">;
  }>;

const Map = ({ children, options, ...containerProps }: MapProps) => {
  const { map, registerMap } = useContext(MapboxContext);

  const containerRef = useCallback((node: HTMLDivElement) => {
    if (!node) return;
    registerMap({
      container: node,
      options,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdateEffect(() => {
    if (map && options.style) map.setStyle(options.style);
  }, [options.style]);

  return (
    <div ref={containerRef} {...containerProps}>
      {map && children}
    </div>
  );
};

export default Map;
