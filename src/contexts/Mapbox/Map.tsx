import { MapboxOptions } from "maplibre-gl";
import { useCallback, useContext } from "react";
import MapboxContext from "./context";

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

  return (
    <div ref={containerRef} {...containerProps}>
      {map && children}
    </div>
  );
};

export default Map;
