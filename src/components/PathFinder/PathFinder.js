import { useContext, useEffect } from "react";
import polyline from "@mapbox/polyline";

import { Mapbox } from "contexts";
import { useSearchState, useResource } from "hooks";

window.polyline = polyline;

const PATH_PRECISION = 5;

const pathEncoder = {
  encode: (path) => polyline.encode(path, PATH_PRECISION),
  decode: (str) => polyline.decode(str, PATH_PRECISION),
};

const defaultPath = [];

const PathFinder = ({ location, setLocation }) => {
  const map = useContext(Mapbox);
  const [waypoints, setWaypoints] = useSearchState("p", defaultPath, pathEncoder);
  let url = null;
  if (waypoints.length > 0) {
    const params = {
      costing: "pedestrian",
      locations: [location, ...waypoints, location].map((point) => ({
        lon: point[0],
        lat: point[1],
        options: { allowUTurn: true },
      })),
    };
    url = `/valhalla/route?json=${JSON.stringify(params)}`;
  }
  const [path] = useResource(url);

  useEffect(() => {
    const onMapClick = (e) => {
      const lngLat = e.lngLat.toArray();
      setWaypoints([...waypoints, lngLat]);
    };

    map.on("click", onMapClick);
    return () => {
      map.off("click", onMapClick);
    };
  }, [map, waypoints, setWaypoints]);

  // // if location changes, we reset waypoints
  // useDidUpdateEffect(() => {
  //   setWaypoints([]);
  // }, [location]);

  useEffect(() => {
    const sourceData = {
      type: "FeatureCollection",
      features: [location, ...waypoints].map((point, index) => ({
        type: "Feature",
        id: index,
        geometry: {
          type: "Point",
          coordinates: point,
        },
      })),
    };

    let source = map.getSource("location");
    if (!source) {
      map.addSource("location", {
        type: "geojson",
        data: sourceData,
      });
      source = map.getSource("location");
    } else {
      source.setData(sourceData);
    }
    if (!map.getLayer("location-layer")) {
      map.addLayer({
        id: "location-layer",
        source: "location",
        type: "circle",
        paint: {
          "circle-color": "white",
          "circle-radius": 10,
          "circle-stroke-color": "rgba(0,0,0,0.7)",
          "circle-stroke-width": 1,
        },
      });
    }

    const onDragMove = (e, waypoint) => {
      const { lat, lng } = e.lngLat;
      sourceData.features[waypoint.id].geometry.coordinates = [lng, lat];
      source.setData(sourceData);
    };

    const onDragEnd = (e, waypoint) => {
      const { lat, lng } = e.lngLat;
      if (waypoint.id === 0) {
        setLocation([lng, lat]);
      } else {
        const newWaypoints = [...waypoints];
        newWaypoints[waypoint.id - 1] = [lng, lat];
        setWaypoints(newWaypoints);
      }
    };

    return map.makeLayerDraggable("location-layer", onDragMove, onDragEnd);
  }, [map, location, waypoints, setWaypoints, setLocation]);

  useEffect(() => {
    if (!path) return;
    const sourceData = {
      type: "FeatureCollection",
      features: path.trip.legs.map((leg) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: polyline.decode(leg.shape, 6).map(([lat, lng]) => [lng, lat]),
        },
      })),
    };

    const source = map.getSource("polyline");
    if (!source) {
      map.addSource("polyline", {
        type: "geojson",
        data: sourceData,
      });
    } else {
      source.setData(sourceData);
    }
    if (!map.getLayer("polyline-background-layer")) {
      map.addLayer(
        {
          id: "polyline-background-layer",
          source: "polyline",
          type: "line",
          paint: {
            "line-color": "#666",
            "line-width": 8,
          },
        },
        "location-layer"
      );
    }
    if (!map.getLayer("polyline-layer")) {
      map.addLayer({
        id: "polyline-layer",
        source: "polyline",
        type: "line",
        paint: {
          "line-color": "#00bcd4",
          "line-width": 5,
        },
      });
    }
  }, [map, path]);

  return null;
};

export default PathFinder;
