import { useContext, useEffect } from "react";

import { Mapbox } from "contexts";

const MapWaypoints = ({ waypoints, setWaypoints }) => {
  const map = useContext(Mapbox);

  useEffect(() => {
    const sourceData = {
      type: "FeatureCollection",
      features: waypoints.map((point, index) => ({
        type: "Feature",
        id: index,
        geometry: {
          type: "Point",
          coordinates: point,
        },
      })),
    };

    let source = map.getSource("waypoints");
    if (!source) {
      map.addSource("waypoints", {
        type: "geojson",
        data: sourceData,
      });
      source = map.getSource("waypoints");
    } else {
      source.setData(sourceData);
    }
    if (!map.getLayer("waypoints-layer")) {
      map.addLayer({
        id: "waypoints-layer",
        source: "waypoints",
        type: "circle",
        paint: {
          "circle-color": "white",
          "circle-radius": 10,
          "circle-stroke-color": "rgba(0,0,0,0.5)",
          "circle-stroke-width": 2,
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
      const newWaypoints = [...waypoints];
      newWaypoints[waypoint.id] = [lng, lat];
      setWaypoints(newWaypoints, true);
    };

    const onClick = (e, waypoint) => {
      setWaypoints(
        waypoints.filter((_, index) => index !== waypoint.id),
        true
      );
    };

    return map.makeLayerDraggable("waypoints-layer", onDragMove, onDragEnd, onClick);
  }, [map, waypoints, setWaypoints]);

  useEffect(() => {
    return () => {
      if (!map) return;
      map.safeRemoveLayer("waypoints-layer");
      map.safeRemoveSource("waypoints");
    };
  }, [map]);

  return null;
};

const MapLocation = ({ location, setLocation }) => {
  const map = useContext(Mapbox);
  useEffect(() => {
    const sourceData = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: location,
      },
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
          "circle-radius": 6,
          "circle-stroke-color": "rgba(0,0,0,0.5)",
          "circle-stroke-width": 8,
        },
      });
    }

    const onDragMove = (e) => {
      const { lat, lng } = e.lngLat;
      sourceData.geometry.coordinates = [lng, lat];
      source.setData(sourceData);
    };

    const onDragEnd = (e) => {
      const { lat, lng } = e.lngLat;
      setLocation([lng, lat], true);
    };

    return map.makeLayerDraggable("location-layer", onDragMove, onDragEnd);
  }, [map, location, setLocation]);

  useEffect(() => {
    return () => {
      if (!map) return;
      map.safeRemoveLayer("location-layer");
      map.safeRemoveSource("location");
    };
  }, [map]);

  return null;
};

const MapPolyline = ({ path }) => {
  const map = useContext(Mapbox);

  useEffect(() => {
    if (!path) return;
    const sourceData = {
      type: "FeatureCollection",
      features: path.trip.legs.map((leg) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: leg.decodedShape,
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
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "rgba(0,0,0,0.5)",
            "line-width": 8,
          },
        },
        "waypoints-layer"
      );
    }
    if (!map.getLayer("polyline-layer")) {
      map.addLayer(
        {
          id: "polyline-layer",
          source: "polyline",
          type: "line",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#00bcd4",
            "line-width": 5,
          },
        },
        "location-layer"
      );
    }
  }, [map, path]);

  useEffect(() => {
    return () => {
      if (!map) return;
      map.safeRemoveLayer("polyline-background-layer");
      map.safeRemoveLayer("polyline-layer");
      map.safeRemoveSource("polyline");
    };
  }, [map]);

  return null;
};

const MapPath = ({ location, setLocation, waypoints, setWaypoints, path }) => {
  const map = useContext(Mapbox);

  useEffect(() => {
    const onMapClick = (e) => {
      const [feature] = map.queryRenderedFeatures(e.point);
      switch (feature && feature.source) {
        case "waypoints":
        case "location":
          e.originalEvent.stopPropagation();
          return;
        default:
          const lngLat = e.lngLat.toArray();
          if (!location) {
            setLocation(lngLat);
          } else {
            setWaypoints([...waypoints, lngLat], true);
          }
      }
    };

    map.on("click", onMapClick);
    return () => {
      map.off("click", onMapClick);
    };
  }, [map, waypoints, setWaypoints, location, setLocation]);

  if (!location) return null;
  return (
    <>
      <MapWaypoints waypoints={waypoints} setWaypoints={setWaypoints} />
      <MapLocation location={location} setLocation={setLocation} />
      {waypoints.length > 0 && <MapPolyline path={path} />}
    </>
  );
};

export default MapPath;
