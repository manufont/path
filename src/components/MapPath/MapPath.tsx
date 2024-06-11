import { useContext, useEffect, useState, useCallback } from "react";
import nearestPointOnLine from "@turf/nearest-point-on-line";

import { DragEventListener, DragEvent, MapboxContext } from "contexts";
import { last } from "helpers/methods";
import { LonLat } from "helpers/geo";
import { MapMouseEvent } from "mapbox-gl";
import { Path } from "hooks/usePath";

type MapHoveredWaypointProps = {
  feature: GeoJSON.Feature<GeoJSON.Point>;
  onDragEnd: DragEventListener;
};

type WaypointFeature = GeoJSON.Feature<
  GeoJSON.Point,
  {
    id: number;
  }
>;

type HoveredFeature = GeoJSON.Feature<GeoJSON.Point, { legId: number; ts: number }>;

const MapHoveredWaypoint = ({ feature, onDragEnd }: MapHoveredWaypointProps) => {
  const { map } = useContext(MapboxContext);

  useEffect(() => {
    if (!map) return;
    const source = map.addOrUpdateSource("hovered-waypoint", {
      type: "geojson",
      data: feature,
    });
    map.addLayerIfNotExist({
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

    const onDragMove: DragEventListener = (e) => {
      const { lat, lng } = e.lngLat;
      feature.geometry.coordinates = [lng, lat];
      source.setData(feature);
    };
    return map.makeLayerDraggable("hovered-waypoint-layer", onDragMove, onDragEnd);
  }, [map, feature, onDragEnd]);

  useEffect(() => {
    return () => {
      if (!map) return;
      map.removeLayerIfExist("hovered-waypoint-layer");
      map.removeSourceIfExist("hovered-waypoint");
    };
  }, [map]);

  return null;
};

type MapWaypointsProps = {
  waypoints: LonLat[];
  setWaypoints: (waypoints: LonLat[], replace?: boolean) => void;
};

const MapWaypoints = ({ waypoints, setWaypoints }: MapWaypointsProps) => {
  const { map } = useContext(MapboxContext);

  useEffect(() => {
    if (!map) return;
    const sourceData = {
      type: "FeatureCollection" as const,
      features: waypoints.map((point, index) => ({
        type: "Feature" as const,
        properties: {
          id: index,
        },
        geometry: {
          type: "Point" as const,
          coordinates: point,
        },
      })),
    };
    const source = map.addOrUpdateSource("waypoints", {
      type: "geojson",
      data: sourceData,
    });
    map.addLayerIfNotExist({
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

    const onDragMove: DragEventListener<WaypointFeature> = (e, waypoint) => {
      const { lat, lng } = e.lngLat;
      sourceData.features[waypoint.properties.id].geometry.coordinates = [lng, lat];
      source.setData(sourceData);
    };

    const onDragEnd: DragEventListener<WaypointFeature> = (e, waypoint) => {
      const { lat, lng } = e.lngLat;
      const newWaypoints = [...waypoints];
      newWaypoints[waypoint.properties.id] = [lng, lat];
      setWaypoints(newWaypoints, true);
    };

    const onClick: DragEventListener<WaypointFeature> = (e, waypoint) => {
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
      map.removeLayerIfExist("waypoints-layer");
      map.removeSourceIfExist("waypoints");
    };
  }, [map]);

  return null;
};

type MapLocationProps = {
  location: LonLat;
  setLocation: (location: LonLat, replace?: boolean) => void;
};

const MapLocation = ({ location, setLocation }: MapLocationProps) => {
  const { map } = useContext(MapboxContext);
  useEffect(() => {
    if (!map) return;
    const sourceData = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Point" as const,
        coordinates: location,
      },
    };
    const source = map.addOrUpdateSource("location", {
      type: "geojson",
      data: sourceData,
    });
    map.addLayerIfNotExist({
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

    const onDragMove: DragEventListener = (e) => {
      const { lat, lng } = e.lngLat;
      sourceData.geometry.coordinates = [lng, lat];
      source.setData(sourceData);
    };

    const onDragEnd: DragEventListener = (e) => {
      const { lat, lng } = e.lngLat;
      setLocation([lng, lat], true);
    };

    return map.makeLayerDraggable("location-layer", onDragMove, onDragEnd);
  }, [map, location, setLocation]);

  useEffect(() => {
    return () => {
      if (!map) return;
      map.removeLayerIfExist("location-layer");
      map.removeSourceIfExist("location");
    };
  }, [map]);

  return null;
};

type MapPolylineProps = {
  path: Path | null;
  setHoveredFeature: (feature: HoveredFeature | null) => void;
};

const MapPolyline = ({ path, setHoveredFeature }: MapPolylineProps) => {
  const { map } = useContext(MapboxContext);

  useEffect(() => {
    if (!path || !map) return;
    const sourceData = {
      type: "FeatureCollection" as const,
      features: path.trip.legs
        .slice(0, path.trip.oneWayMode ? undefined : -1)
        .map((leg, index) => ({
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: leg.decodedShape,
          },
          properties: {
            id: index,
          },
        })),
    };

    map.addOrUpdateSource("polyline", {
      type: "geojson",
      data: sourceData,
    });
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

      const onMouseMove = (e: DragEvent) => {
        e.originalEvent.stopPropagation();
        const features = map.queryRenderedFeatures(e.point);
        const feature = features.find(
          (_) => _.layer.id === "polyline-box-layer"
        ) as unknown as GeoJSON.Feature<GeoJSON.LineString, { id: number }>;
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
    map.addLayerIfNotExist(
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
    map.addLayerIfNotExist(
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
  }, [map, path, setHoveredFeature]);

  useEffect(() => {
    if (!path || !map) return;
    const sourceData = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: path.trip.oneWayMode ? [] : last(path.trip.legs).decodedShape,
      },
    };

    map.addOrUpdateSource("return-polyline", {
      type: "geojson",
      data: sourceData,
    });
    map.addLayerIfNotExist(
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
    map.addLayerIfNotExist(
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
  }, [map, path]);

  useEffect(() => {
    return () => {
      if (!map) return;
      map.removeLayerIfExist("polyline-background-layer");
      map.removeLayerIfExist("polyline-box-layer");
      map.removeLayerIfExist("polyline-layer");
      map.removeLayerIfExist("return-polyline-background-layer");
      map.removeLayerIfExist("return-polyline-layer");
      map.removeSourceIfExist("polyline");
      map.removeSourceIfExist("return-polyline");
    };
  }, [map]);

  return null;
};

type MapPathProps = {
  location: LonLat | null;
  setLocation: (location: LonLat, replace?: boolean) => void;
  waypoints: LonLat[];
  setWaypoints: (waypoints: LonLat[], replace?: boolean) => void;
  path: Path | null;
};

const MapPath = ({ location, setLocation, waypoints, setWaypoints, path }: MapPathProps) => {
  const { map } = useContext(MapboxContext);
  const [hoveredFeature, setHoveredFeature] = useState<HoveredFeature | null>(null);

  useEffect(() => {
    if (!map) return;
    const onMapClick = (e: MapMouseEvent) => {
      const [feature] = map.queryRenderedFeatures(e.point);
      switch (feature && feature.source) {
        case "waypoints":
        case "location":
        case "polyline":
          e.originalEvent.stopPropagation();
          return;
        default:
          const lonLat = e.lngLat.toArray() as LonLat;
          if (!location) {
            setLocation(lonLat);
          } else {
            setWaypoints([...waypoints, lonLat], true);
          }
      }
    };

    map.on("click", onMapClick);
    return () => {
      map.off("click", onMapClick);
    };
  }, [map, waypoints, setWaypoints, location, setLocation]);

  const onHoveredWaypointDragEnd: DragEventListener = useCallback(
    (e) => {
      if (!hoveredFeature) return;
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
      <MapWaypoints waypoints={waypoints} setWaypoints={setWaypoints} />
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
