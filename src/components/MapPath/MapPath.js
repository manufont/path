import { useContext, useEffect, useState, useCallback } from "react";
import nearestPointOnLine from "@turf/nearest-point-on-line";

import { Mapbox } from "contexts";
import { last } from "helpers/methods";

const MapHoveredWaypoint = ({ feature, onDragEnd }) => {
  const { map } = useContext(Mapbox);

  useEffect(() => {
    let source = map.getSource("hovered-waypoint");
    if (!source) {
      map.addSource("hovered-waypoint", {
        type: "geojson",
        data: feature,
      });
      source = map.getSource("hovered-waypoint");
    } else {
      source.setData(feature);
    }
    if (!map.getLayer("hovered-waypoint-layer")) {
      map.addLayer({
        id: "hovered-waypoint-layer",
        source: "hovered-waypoint",
        type: "circle",
        paint: {
          "circle-color": "white",
          "circle-radius": 10,
          "circle-stroke-color": "rgba(0,0,0,0.5)",
          "circle-stroke-width": 2,
        },
      });
    }

    const onDragMove = (e) => {
      const { lat, lng } = e.lngLat;
      feature.geometry.coordinates = [lng, lat];
      source.setData(feature);
    };
    return map.makeLayerDraggable("hovered-waypoint-layer", onDragMove, onDragEnd);
  }, [map, feature, onDragEnd]);

  useEffect(() => {
    return () => {
      if (!map) return;
      map.removeLayer("hovered-waypoint-layer");
      map.removeSource("hovered-waypoint");
    };
  }, [map]);

  return null;
};

const MapWaypoints = ({ waypoints, setWaypoints, setHoveredFeature }) => {
  const { map } = useContext(Mapbox);

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
      map.removeLayer("waypoints-layer");
      map.removeSource("waypoints");
    };
  }, [map]);

  return null;
};

const MapLocation = ({ location, setLocation }) => {
  const { map } = useContext(Mapbox);
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
      map.removeLayer("location-layer");
      map.removeSource("location");
    };
  }, [map]);

  return null;
};

const MapPolyline = ({ path, setHoveredFeature }) => {
  const { map } = useContext(Mapbox);

  useEffect(() => {
    if (!path) return;
    const sourceData = {
      type: "FeatureCollection",
      features: path.trip.legs.slice(0, -1).map((leg, index) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: leg.decodedShape,
        },
        properties: {
          id: index,
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
    if (!map.getLayer("polyline-box-layer")) {
      map.addLayer(
        {
          id: "polyline-box-layer",
          source: "polyline",
          type: "line",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "rgba(0,0,0,0)",
            "line-width": 40,
          },
        },
        "waypoints-layer"
      );

      const onMouseMove = (e) => {
        e.originalEvent.stopPropagation();
        const features = map.queryRenderedFeatures(e.point);
        const feature = features.find((_) => _.layer.id === "polyline-box-layer");
        const onWaypoints = features.find((_) =>
          ["waypoints-layer", "location-layer"].includes(_.layer.id)
        );
        if (onWaypoints) {
          setHoveredFeature(null);
          return;
        }
        const lngLat = e.lngLat.toArray();
        const closestLatLng = nearestPointOnLine(feature, lngLat);
        setHoveredFeature({
          ...closestLatLng,
          properties: {
            ts: Date.now(),
            legId: feature.properties.id,
          },
        });
        return false;
      };
      map.on("mousemove", "polyline-box-layer", onMouseMove);
      map.on("touchend", "polyline-box-layer", onMouseMove);
      let onDrag = false;
      map.on("mousedown", "polyline-box-layer", (e) => {
        e.originalEvent.stopPropagation();
        onDrag = true;
        map.once("mouseup", () => {
          onDrag = false;
        });
      });
      map.on("mouseleave", "polyline-box-layer", (e) => {
        if (!onDrag) {
          setHoveredFeature(null);

          map.getCanvas().style.cursor = "";
        }
      });
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
  }, [map, path, setHoveredFeature]);

  useEffect(() => {
    if (!path) return;
    const sourceData = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: last(path.trip.legs).decodedShape,
      },
    };

    const source = map.getSource("return-polyline");
    if (!source) {
      map.addSource("return-polyline", {
        type: "geojson",
        data: sourceData,
      });
    } else {
      source.setData(sourceData);
    }
    if (!map.getLayer("return-polyline-background-layer")) {
      map.addLayer(
        {
          id: "return-polyline-background-layer",
          source: "return-polyline",
          type: "line",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "rgba(0,0,0,0.5)",
            "line-dasharray": [
              "step",
              ["zoom"],
              ["literal", [0, 2 * (5 / 8)]],
              16,
              ["literal", [0, 5 * (5 / 8)]],
            ],
            "line-width": 8,
          },
        },
        "waypoints-layer"
      );
    }
    if (!map.getLayer("return-polyline-layer")) {
      map.addLayer(
        {
          id: "return-polyline-layer",
          source: "return-polyline",
          type: "line",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#00bcd4",
            "line-dasharray": ["step", ["zoom"], ["literal", [0, 2]], 16, ["literal", [0, 5]]],
            "line-width": 5,
          },
        },
        "polyline-layer"
      );
    }
  }, [map, path]);

  useEffect(() => {
    return () => {
      if (!map) return;
      map.removeLayer("polyline-background-layer");
      map.removeLayer("polyline-box-layer");
      map.removeLayer("polyline-layer");
      map.removeLayer("return-polyline-background-layer");
      map.removeLayer("return-polyline-layer");
      map.removeSource("polyline");
      map.removeSource("return-polyline");
    };
  }, [map]);

  return null;
};

const MapPath = ({ location, setLocation, waypoints, setWaypoints, path }) => {
  const { map } = useContext(Mapbox);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    const onMapClick = (e) => {
      const [feature] = map.queryRenderedFeatures(e.point);
      switch (feature && feature.source) {
        case "waypoints":
        case "location":
        case "polyline":
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

  const onHoveredWaypointDragEnd = useCallback(
    (e) => {
      const { lat, lng } = e.lngLat;
      const { legId } = hoveredFeature.properties;
      const newWaypoints = waypoints.slice();
      newWaypoints.splice(legId, 0, [lng, lat]);
      setWaypoints(newWaypoints, true);
      setHoveredFeature(null);
    },
    [hoveredFeature, setWaypoints, waypoints]
  );

  if (!location) return null;
  return (
    <>
      <MapWaypoints
        waypoints={waypoints}
        setWaypoints={setWaypoints}
        setHoveredFeature={setHoveredFeature}
      />
      <MapLocation location={location} setLocation={setLocation} />
      {waypoints.length > 0 && (
        <>
          <MapPolyline path={path} setHoveredFeature={setHoveredFeature} />
          {hoveredFeature && (
            <MapHoveredWaypoint feature={hoveredFeature} onDragEnd={onHoveredWaypointDragEnd} />
          )}
        </>
      )}
    </>
  );
};

export default MapPath;
