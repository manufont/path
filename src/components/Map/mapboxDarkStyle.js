const TILE_SERVER_URL = process.env.REACT_APP_TILE_SERVER_URL;

// dark theme obtained with the following code:
// const handleHsl = (elt, index) => {
//   if (index === 0) return elt;
//   const [h, s, l, ...rest] = elt.split(",");
//   const [value, ...valueRest] = l.split("%");
//   const newValue = 100 - parseInt(value);
//   const newL = [newValue, ...valueRest].join("%");
//   return [h, s, newL, ...rest].join(",");
// };
// const getDarkStyle = (lightStyle) =>
//   JSON.parse(
//     JSON.stringify(lightStyle)
//       .split("hsl(")
//       .map(handleHsl)
//       .join("hsl(")
//       .split("hsla(")
//       .map(handleHsl)
//       .join("hsla(")
//   );

const sources = {
  openmaptiles: {
    type: "vector",
    tiles: [`${document.location.origin}${TILE_SERVER_URL}/data/v3/{z}/{x}/{y}.pbf`],
    name: "OpenMapTiles",
    format: "pbf",
    basename: "osm-2017-07-03-v3.6.1-planet.mbtiles",
    id: "openmaptiles",
    attribution:
      '<a href="http://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/about/" target="_blank">&copy; OpenStreetMap contributors</a>',
    center: [-12.2168, 28.6135, 4],
    description: "A tileset showcasing all layers in OpenMapTiles. http://openmaptiles.org",
    maxzoom: 14,
    minzoom: 0,
    pixel_scale: "256",
    vector_layers: [
      { maxzoom: 14, fields: { class: "String" }, minzoom: 0, id: "water", description: "" },
      {
        maxzoom: 14,
        fields: {
          "name:mt": "String",
          "name:pt": "String",
          "name:az": "String",
          "name:ka": "String",
          "name:rm": "String",
          "name:ko": "String",
          "name:kn": "String",
          "name:ar": "String",
          "name:cs": "String",
          name_de: "String",
          "name:ro": "String",
          "name:it": "String",
          name_int: "String",
          "name:ru": "String",
          "name:pl": "String",
          "name:ca": "String",
          "name:lv": "String",
          "name:bg": "String",
          "name:cy": "String",
          "name:fi": "String",
          "name:he": "String",
          "name:da": "String",
          "name:de": "String",
          "name:tr": "String",
          "name:fr": "String",
          "name:mk": "String",
          "name:nonlatin": "String",
          "name:fy": "String",
          "name:be": "String",
          "name:zh": "String",
          "name:sr": "String",
          "name:sl": "String",
          "name:nl": "String",
          "name:ja": "String",
          "name:lt": "String",
          "name:no": "String",
          "name:kk": "String",
          "name:ko_rm": "String",
          "name:ja_rm": "String",
          "name:br": "String",
          "name:bs": "String",
          "name:lb": "String",
          "name:la": "String",
          "name:sk": "String",
          "name:uk": "String",
          "name:hy": "String",
          "name:sv": "String",
          name_en: "String",
          "name:hu": "String",
          "name:hr": "String",
          class: "String",
          "name:sq": "String",
          "name:el": "String",
          "name:ga": "String",
          "name:en": "String",
          name: "String",
          "name:gd": "String",
          "name:ja_kana": "String",
          "name:is": "String",
          "name:th": "String",
          "name:latin": "String",
          "name:sr-Latn": "String",
          "name:et": "String",
          "name:es": "String",
        },
        minzoom: 0,
        id: "waterway",
        description: "",
      },
      {
        maxzoom: 14,
        fields: { class: "String", subclass: "String" },
        minzoom: 0,
        id: "landcover",
        description: "",
      },
      { maxzoom: 14, fields: { class: "String" }, minzoom: 0, id: "landuse", description: "" },
      {
        maxzoom: 14,
        fields: {
          "name:mt": "String",
          "name:pt": "String",
          "name:az": "String",
          "name:ka": "String",
          "name:rm": "String",
          "name:ko": "String",
          "name:kn": "String",
          "name:ar": "String",
          "name:cs": "String",
          rank: "Number",
          name_de: "String",
          "name:ro": "String",
          "name:it": "String",
          name_int: "String",
          "name:lv": "String",
          "name:pl": "String",
          "name:de": "String",
          "name:ca": "String",
          "name:bg": "String",
          "name:cy": "String",
          "name:fi": "String",
          "name:he": "String",
          "name:da": "String",
          ele: "Number",
          "name:tr": "String",
          "name:fr": "String",
          "name:mk": "String",
          "name:nonlatin": "String",
          "name:fy": "String",
          "name:be": "String",
          "name:zh": "String",
          "name:sl": "String",
          "name:nl": "String",
          "name:ja": "String",
          "name:lt": "String",
          "name:no": "String",
          "name:kk": "String",
          "name:ko_rm": "String",
          "name:ja_rm": "String",
          "name:br": "String",
          "name:bs": "String",
          "name:lb": "String",
          "name:la": "String",
          "name:sk": "String",
          "name:uk": "String",
          "name:hy": "String",
          "name:ru": "String",
          "name:sv": "String",
          name_en: "String",
          "name:hu": "String",
          "name:hr": "String",
          "name:sr": "String",
          "name:sq": "String",
          "name:el": "String",
          "name:ga": "String",
          "name:en": "String",
          name: "String",
          "name:gd": "String",
          ele_ft: "Number",
          "name:ja_kana": "String",
          "name:is": "String",
          osm_id: "Number",
          "name:th": "String",
          "name:latin": "String",
          "name:sr-Latn": "String",
          "name:et": "String",
          "name:es": "String",
        },
        minzoom: 0,
        id: "mountain_peak",
        description: "",
      },
      { maxzoom: 14, fields: { class: "String" }, minzoom: 0, id: "park", description: "" },
      {
        maxzoom: 14,
        fields: { admin_level: "Number", disputed: "Number", maritime: "Number" },
        minzoom: 0,
        id: "boundary",
        description: "",
      },
      { maxzoom: 14, fields: { class: "String" }, minzoom: 0, id: "aeroway", description: "" },
      {
        maxzoom: 14,
        fields: {
          brunnel: "String",
          ramp: "Number",
          class: "String",
          service: "String",
          oneway: "Number",
        },
        minzoom: 0,
        id: "transportation",
        description: "",
      },
      {
        maxzoom: 14,
        fields: { render_min_height: "Number", render_height: "Number" },
        minzoom: 0,
        id: "building",
        description: "",
      },
      {
        maxzoom: 14,
        fields: {
          "name:mt": "String",
          "name:pt": "String",
          "name:az": "String",
          "name:ka": "String",
          "name:rm": "String",
          "name:ko": "String",
          "name:kn": "String",
          "name:ar": "String",
          "name:cs": "String",
          name_de: "String",
          "name:ro": "String",
          "name:it": "String",
          name_int: "String",
          "name:ru": "String",
          "name:pl": "String",
          "name:ca": "String",
          "name:lv": "String",
          "name:bg": "String",
          "name:cy": "String",
          "name:fi": "String",
          "name:he": "String",
          "name:da": "String",
          "name:de": "String",
          "name:tr": "String",
          "name:fr": "String",
          "name:mk": "String",
          "name:nonlatin": "String",
          "name:fy": "String",
          "name:be": "String",
          "name:zh": "String",
          "name:sr": "String",
          "name:sl": "String",
          "name:nl": "String",
          "name:ja": "String",
          "name:lt": "String",
          "name:no": "String",
          "name:kk": "String",
          "name:ko_rm": "String",
          "name:ja_rm": "String",
          "name:br": "String",
          "name:bs": "String",
          "name:lb": "String",
          "name:la": "String",
          "name:sk": "String",
          "name:uk": "String",
          "name:hy": "String",
          "name:sv": "String",
          name_en: "String",
          "name:hu": "String",
          "name:hr": "String",
          class: "String",
          "name:sq": "String",
          "name:el": "String",
          "name:ga": "String",
          "name:en": "String",
          name: "String",
          "name:gd": "String",
          "name:ja_kana": "String",
          "name:is": "String",
          "name:th": "String",
          "name:latin": "String",
          "name:sr-Latn": "String",
          "name:et": "String",
          "name:es": "String",
        },
        minzoom: 0,
        id: "water_name",
        description: "",
      },
      {
        maxzoom: 14,
        fields: {
          "name:mt": "String",
          "name:pt": "String",
          "name:az": "String",
          "name:ka": "String",
          "name:rm": "String",
          "name:ko": "String",
          "name:kn": "String",
          "name:ar": "String",
          "name:cs": "String",
          name_de: "String",
          "name:ro": "String",
          "name:it": "String",
          name_int: "String",
          "name:ru": "String",
          "name:pl": "String",
          "name:ca": "String",
          "name:lv": "String",
          "name:bg": "String",
          "name:cy": "String",
          "name:fi": "String",
          "name:he": "String",
          "name:da": "String",
          "name:de": "String",
          "name:tr": "String",
          "name:fr": "String",
          "name:mk": "String",
          "name:nonlatin": "String",
          "name:fy": "String",
          "name:be": "String",
          "name:zh": "String",
          "name:sr": "String",
          "name:sl": "String",
          "name:nl": "String",
          "name:ja": "String",
          "name:lt": "String",
          "name:no": "String",
          "name:kk": "String",
          "name:ko_rm": "String",
          "name:ja_rm": "String",
          "name:br": "String",
          "name:bs": "String",
          "name:lb": "String",
          "name:la": "String",
          "name:sk": "String",
          "name:uk": "String",
          "name:hy": "String",
          "name:sv": "String",
          name_en: "String",
          "name:hu": "String",
          "name:hr": "String",
          class: "String",
          "name:sq": "String",
          network: "String",
          "name:el": "String",
          "name:ga": "String",
          "name:en": "String",
          name: "String",
          "name:gd": "String",
          ref: "String",
          "name:ja_kana": "String",
          ref_length: "Number",
          "name:is": "String",
          "name:th": "String",
          "name:latin": "String",
          "name:sr-Latn": "String",
          "name:et": "String",
          "name:es": "String",
        },
        minzoom: 0,
        id: "transportation_name",
        description: "",
      },
      {
        maxzoom: 14,
        fields: {
          "name:mt": "String",
          "name:pt": "String",
          "name:az": "String",
          "name:ka": "String",
          "name:rm": "String",
          "name:ko": "String",
          "name:kn": "String",
          "name:ar": "String",
          "name:cs": "String",
          rank: "Number",
          name_de: "String",
          "name:ro": "String",
          "name:it": "String",
          name_int: "String",
          "name:ru": "String",
          "name:pl": "String",
          "name:ca": "String",
          "name:lv": "String",
          "name:bg": "String",
          "name:cy": "String",
          "name:hr": "String",
          "name:fi": "String",
          "name:he": "String",
          "name:da": "String",
          "name:de": "String",
          "name:tr": "String",
          "name:fr": "String",
          "name:mk": "String",
          "name:nonlatin": "String",
          "name:fy": "String",
          "name:be": "String",
          "name:zh": "String",
          "name:sr": "String",
          "name:sl": "String",
          "name:nl": "String",
          "name:ja": "String",
          "name:ko_rm": "String",
          "name:no": "String",
          "name:kk": "String",
          capital: "Number",
          "name:ja_rm": "String",
          "name:br": "String",
          "name:bs": "String",
          "name:lb": "String",
          "name:la": "String",
          "name:sk": "String",
          "name:uk": "String",
          "name:hy": "String",
          "name:sv": "String",
          name_en: "String",
          "name:hu": "String",
          "name:lt": "String",
          class: "String",
          "name:sq": "String",
          "name:el": "String",
          "name:ga": "String",
          "name:en": "String",
          name: "String",
          "name:gd": "String",
          "name:ja_kana": "String",
          "name:is": "String",
          "name:th": "String",
          "name:latin": "String",
          "name:sr-Latn": "String",
          "name:et": "String",
          "name:es": "String",
        },
        minzoom: 0,
        id: "place",
        description: "",
      },
      {
        maxzoom: 14,
        fields: { housenumber: "String" },
        minzoom: 0,
        id: "housenumber",
        description: "",
      },
      {
        maxzoom: 14,
        fields: {
          "name:mt": "String",
          "name:pt": "String",
          "name:az": "String",
          "name:ka": "String",
          "name:rm": "String",
          "name:ko": "String",
          "name:kn": "String",
          "name:ar": "String",
          "name:cs": "String",
          rank: "Number",
          name_de: "String",
          "name:ro": "String",
          "name:it": "String",
          name_int: "String",
          "name:ru": "String",
          "name:pl": "String",
          "name:ca": "String",
          "name:lv": "String",
          "name:bg": "String",
          "name:cy": "String",
          "name:fi": "String",
          "name:he": "String",
          "name:da": "String",
          subclass: "String",
          "name:de": "String",
          "name:tr": "String",
          "name:fr": "String",
          "name:mk": "String",
          "name:nonlatin": "String",
          "name:fy": "String",
          "name:be": "String",
          "name:zh": "String",
          "name:sr": "String",
          "name:sl": "String",
          "name:nl": "String",
          "name:ja": "String",
          "name:lt": "String",
          "name:no": "String",
          "name:kk": "String",
          "name:ko_rm": "String",
          "name:ja_rm": "String",
          "name:br": "String",
          "name:bs": "String",
          "name:lb": "String",
          "name:la": "String",
          "name:sk": "String",
          "name:uk": "String",
          "name:hy": "String",
          "name:sv": "String",
          name_en: "String",
          "name:hu": "String",
          "name:hr": "String",
          class: "String",
          "name:sq": "String",
          "name:el": "String",
          "name:ga": "String",
          "name:en": "String",
          name: "String",
          "name:gd": "String",
          "name:ja_kana": "String",
          "name:is": "String",
          "name:th": "String",
          "name:latin": "String",
          "name:sr-Latn": "String",
          "name:et": "String",
          "name:es": "String",
        },
        minzoom: 0,
        id: "poi",
        description: "",
      },
    ],
    version: "3.6.1",
    maskLevel: "8",
    bounds: [-180, -85.0511, 180, 85.0511],
    planettime: "1499040000000",
    tilejson: "2.0.0",
  },
};

const layers = [
  { id: "background", paint: { "background-color": "hsl(47, 26%,12%)" }, type: "background" },
  {
    filter: [
      "all",
      ["==", "$type", "Polygon"],
      ["in", "class", "residential", "suburb", "neighbourhood"],
    ],
    id: "landuse-residential",
    paint: { "fill-color": "hsl(47, 13%,14%)", "fill-opacity": 0.7 },
    source: "openmaptiles",
    "source-layer": "landuse",
    type: "fill",
  },
  {
    filter: ["==", "class", "grass"],
    id: "landcover_grass",
    paint: { "fill-color": "hsl(82, 46%,28%)", "fill-opacity": 0.45 },
    source: "openmaptiles",
    "source-layer": "landcover",
    type: "fill",
  },
  {
    filter: ["==", "class", "wood"],
    id: "landcover_wood",
    paint: {
      "fill-color": "hsl(82, 46%,28%)",
      "fill-opacity": {
        base: 1,
        stops: [
          [8, 0.6],
          [22, 1],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "landcover",
    type: "fill",
  },
  {
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "intermittent", 1]],
    id: "water",
    paint: { "fill-color": "hsl(205, 56%,27%)" },
    source: "openmaptiles",
    "source-layer": "water",
    type: "fill",
  },
  {
    filter: ["all", ["==", "$type", "Polygon"], ["==", "intermittent", 1]],
    id: "water_intermittent",
    paint: { "fill-color": "hsl(205, 56%,27%)", "fill-opacity": 0.7 },
    source: "openmaptiles",
    "source-layer": "water",
    type: "fill",
  },
  {
    filter: ["==", "subclass", "ice_shelf"],
    id: "landcover-ice-shelf",
    paint: { "fill-color": "hsl(47, 26%,12%)", "fill-opacity": 0.8 },
    source: "openmaptiles",
    "source-layer": "landcover",
    type: "fill",
  },
  {
    filter: ["==", "subclass", "glacier"],
    id: "landcover-glacier",
    paint: {
      "fill-color": "hsl(47, 22%,6%)",
      "fill-opacity": {
        base: 1,
        stops: [
          [0, 1],
          [8, 0.5],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "landcover",
    type: "fill",
  },
  {
    filter: ["all", ["in", "class", "sand"]],
    id: "landcover_sand",
    metadata: {},
    paint: { "fill-antialias": false, "fill-color": "hsl(54, 81%,47%)", "fill-opacity": 0.3 },
    source: "openmaptiles",
    "source-layer": "landcover",
    type: "fill",
  },
  {
    filter: ["==", "class", "agriculture"],
    id: "landuse",
    paint: { "fill-color": "hsl(37, 38%,13%)" },
    source: "openmaptiles",
    "source-layer": "landuse",
    type: "fill",
  },
  {
    filter: ["==", "class", "national_park"],
    id: "landuse_overlay_national_park",
    paint: {
      "fill-color": "hsl(70, 60%,19%)",
      "fill-opacity": {
        base: 1,
        stops: [
          [5, 0],
          [9, 0.75],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "landcover",
    type: "fill",
  },
  {
    filter: ["all", ["==", "$type", "LineString"], ["==", "brunnel", "tunnel"]],
    id: "waterway-tunnel",
    paint: {
      "line-color": "hsl(205, 56%,27%)",
      "line-dasharray": [3, 3],
      "line-gap-width": {
        stops: [
          [12, 0],
          [20, 6],
        ],
      },
      "line-opacity": 1,
      "line-width": {
        base: 1.4,
        stops: [
          [8, 1],
          [20, 2],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "waterway",
    type: "line",
  },
  {
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["!in", "brunnel", "tunnel", "bridge"],
      ["!=", "intermittent", 1],
    ],
    id: "waterway",
    paint: {
      "line-color": "hsl(205, 56%,27%)",
      "line-opacity": 1,
      "line-width": {
        base: 1.4,
        stops: [
          [8, 1],
          [20, 8],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "waterway",
    type: "line",
  },
  {
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["!in", "brunnel", "tunnel", "bridge"],
      ["==", "intermittent", 1],
    ],
    id: "waterway_intermittent",
    paint: {
      "line-color": "hsl(205, 56%,27%)",
      "line-opacity": 1,
      "line-width": {
        base: 1.4,
        stops: [
          [8, 1],
          [20, 8],
        ],
      },
      "line-dasharray": [2, 1],
    },
    source: "openmaptiles",
    "source-layer": "waterway",
    type: "line",
  },
  {
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["==", "brunnel", "tunnel"],
      ["==", "class", "transit"],
    ],
    id: "tunnel_railway_transit",
    layout: { "line-cap": "butt", "line-join": "miter" },
    minzoom: 0,
    paint: {
      "line-color": "hsl(34, 12%,34%)",
      "line-dasharray": [3, 3],
      "line-opacity": {
        base: 1,
        stops: [
          [11, 0],
          [16, 1],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    id: "building",
    paint: {
      "fill-antialias": true,
      "fill-color": "hsl(39, 33%,19%)",
      "fill-opacity": {
        base: 1,
        stops: [
          [13, 0],
          [15, 1],
        ],
      },
      "fill-outline-color": {
        stops: [
          [15, "hsla(28, 43%,30%, 0)"],
          [16, "hsla(28, 43%,30%, 0.5)"],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "building",
    type: "fill",
  },
  {
    filter: ["==", "$type", "Point"],
    id: "housenumber",
    layout: { "text-field": "{housenumber}", "text-font": ["Noto Sans Regular"], "text-size": 10 },
    minzoom: 17,
    paint: { "text-color": "hsl(28, 43%,30%)" },
    source: "openmaptiles",
    "source-layer": "housenumber",
    type: "symbol",
  },
  {
    id: "road_area_pier",
    type: "fill",
    metadata: {},
    source: "openmaptiles",
    "source-layer": "transportation",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "class", "pier"]],
    paint: { "fill-color": "hsl(47, 26%,12%)", "fill-antialias": true },
  },
  {
    id: "road_pier",
    type: "line",
    metadata: {},
    source: "openmaptiles",
    "source-layer": "transportation",
    filter: ["all", ["==", "$type", "LineString"], ["in", "class", "pier"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "hsl(47, 26%,12%)",
      "line-width": {
        base: 1.2,
        stops: [
          [15, 1],
          [17, 4],
        ],
      },
    },
  },
  {
    filter: ["all", ["==", "$type", "Polygon"], ["in", "brunnel", "bridge"]],
    id: "road_bridge_area",
    layout: {},
    paint: { "fill-color": "hsl(47, 26%,12%)", "fill-opacity": 0.5 },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "fill",
  },
  {
    filter: ["all", ["==", "$type", "LineString"], ["in", "class", "path", "track"]],
    id: "road_path",
    layout: { "line-cap": "square", "line-join": "bevel" },
    paint: {
      "line-color": "hsl(0, 0%,3%)",
      "line-dasharray": [1, 1],
      "line-width": {
        base: 1.55,
        stops: [
          [4, 0.25],
          [20, 10],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: ["all", ["==", "$type", "LineString"], ["in", "class", "minor", "service"]],
    id: "road_minor",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "hsl(0, 0%,3%)",
      "line-width": {
        base: 1.55,
        stops: [
          [4, 0.25],
          [20, 30],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
    minzoom: 13,
  },
  {
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["==", "brunnel", "tunnel"],
      ["==", "class", "minor_road"],
    ],
    id: "tunnel_minor",
    layout: { "line-cap": "butt", "line-join": "miter" },
    paint: {
      "line-color": "hsl(0, 0%,6%)",
      "line-dasharray": [0.36, 0.18],
      "line-width": {
        base: 1.55,
        stops: [
          [4, 0.25],
          [20, 30],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["==", "brunnel", "tunnel"],
      ["in", "class", "primary", "secondary", "tertiary", "trunk"],
    ],
    id: "tunnel_major",
    layout: { "line-cap": "butt", "line-join": "miter" },
    paint: {
      "line-color": "hsl(0, 0%,0%)",
      "line-dasharray": [0.28, 0.14],
      "line-width": {
        base: 1.4,
        stops: [
          [6, 0.5],
          [20, 30],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: ["all", ["==", "$type", "Polygon"], ["in", "class", "runway", "taxiway"]],
    id: "aeroway-area",
    metadata: { "mapbox:group": "1444849345966.4436" },
    minzoom: 4,
    paint: {
      "fill-color": "hsl(0, 0%,0%)",
      "fill-opacity": {
        base: 1,
        stops: [
          [13, 0],
          [14, 1],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "aeroway",
    type: "fill",
  },
  {
    filter: ["all", ["in", "class", "taxiway"], ["==", "$type", "LineString"]],
    id: "aeroway-taxiway",
    layout: { "line-cap": "round", "line-join": "round" },
    metadata: { "mapbox:group": "1444849345966.4436" },
    minzoom: 12,
    paint: {
      "line-color": "hsl(0, 0%,0%)",
      "line-opacity": 1,
      "line-width": {
        base: 1.5,
        stops: [
          [12, 1],
          [17, 10],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "aeroway",
    type: "line",
  },
  {
    filter: ["all", ["in", "class", "runway"], ["==", "$type", "LineString"]],
    id: "aeroway-runway",
    layout: { "line-cap": "round", "line-join": "round" },
    metadata: { "mapbox:group": "1444849345966.4436" },
    minzoom: 4,
    paint: {
      "line-color": "hsl(0, 0%,0%)",
      "line-opacity": 1,
      "line-width": {
        base: 1.5,
        stops: [
          [11, 4],
          [17, 50],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "aeroway",
    type: "line",
  },
  {
    filter: ["all", ["==", "$type", "LineString"], ["in", "class", "trunk", "primary"]],
    id: "road_trunk_primary",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "hsl(0, 0%,0%)",
      "line-width": {
        base: 1.4,
        stops: [
          [6, 0.5],
          [20, 30],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: ["all", ["==", "$type", "LineString"], ["in", "class", "secondary", "tertiary"]],
    id: "road_secondary_tertiary",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "hsl(0, 0%,0%)",
      "line-width": {
        base: 1.4,
        stops: [
          [6, 0.5],
          [20, 20],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: ["all", ["==", "$type", "LineString"], ["==", "class", "motorway"]],
    id: "road_major_motorway",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "hsl(0, 0%,0%)",
      "line-offset": 0,
      "line-width": {
        base: 1.4,
        stops: [
          [8, 1],
          [16, 10],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: ["all", ["==", "class", "transit"], ["!=", "brunnel", "tunnel"]],
    id: "railway-transit",
    paint: {
      "line-color": "hsl(34, 12%,34%)",
      "line-opacity": {
        base: 1,
        stops: [
          [11, 0],
          [16, 1],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: ["==", "class", "rail"],
    id: "railway",
    paint: {
      "line-color": "hsl(34, 12%,34%)",
      "line-opacity": {
        base: 1,
        stops: [
          [11, 0],
          [16, 1],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: ["all", ["==", "$type", "LineString"], ["==", "brunnel", "bridge"]],
    id: "waterway-bridge-case",
    layout: { "line-cap": "butt", "line-join": "miter" },
    paint: {
      "line-color": "hsl(0, 0%,27%)",
      "line-gap-width": {
        base: 1.55,
        stops: [
          [4, 0.25],
          [20, 30],
        ],
      },
      "line-width": {
        base: 1.6,
        stops: [
          [12, 0.5],
          [20, 10],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "waterway",
    type: "line",
  },
  {
    filter: ["all", ["==", "$type", "LineString"], ["==", "brunnel", "bridge"]],
    id: "waterway-bridge",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "hsl(205, 56%,27%)",
      "line-width": {
        base: 1.55,
        stops: [
          [4, 0.25],
          [20, 30],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "waterway",
    type: "line",
  },
  {
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["==", "brunnel", "bridge"],
      ["==", "class", "minor_road"],
    ],
    id: "bridge_minor case",
    layout: { "line-cap": "butt", "line-join": "miter" },
    paint: {
      "line-color": "hsl(0, 0%,13%)",
      "line-gap-width": {
        base: 1.55,
        stops: [
          [4, 0.25],
          [20, 30],
        ],
      },
      "line-width": {
        base: 1.6,
        stops: [
          [12, 0.5],
          [20, 10],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["==", "brunnel", "bridge"],
      ["in", "class", "primary", "secondary", "tertiary", "trunk"],
    ],
    id: "bridge_major case",
    layout: { "line-cap": "butt", "line-join": "miter" },
    paint: {
      "line-color": "hsl(0, 0%,13%)",
      "line-gap-width": {
        base: 1.55,
        stops: [
          [4, 0.25],
          [20, 30],
        ],
      },
      "line-width": {
        base: 1.6,
        stops: [
          [12, 0.5],
          [20, 10],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["==", "brunnel", "bridge"],
      ["==", "class", "minor_road"],
    ],
    id: "bridge_minor",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "hsl(0, 0%,6%)",
      "line-width": {
        base: 1.55,
        stops: [
          [4, 0.25],
          [20, 30],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["==", "brunnel", "bridge"],
      ["in", "class", "primary", "secondary", "tertiary", "trunk"],
    ],
    id: "bridge_major",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "hsl(0, 0%,0%)",
      "line-width": {
        base: 1.4,
        stops: [
          [6, 0.5],
          [20, 30],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "transportation",
    type: "line",
  },
  {
    filter: ["in", "admin_level", 4, 6, 8],
    id: "admin_sub",
    paint: { "line-color": "hsla(0, 0%,40%, 0.5)", "line-dasharray": [2, 1] },
    source: "openmaptiles",
    "source-layer": "boundary",
    type: "line",
  },
  {
    filter: ["all", ["<=", "admin_level", 2], ["==", "$type", "LineString"]],
    id: "admin_country",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "hsl(0, 0%,40%)",
      "line-width": {
        base: 1.3,
        stops: [
          [3, 0.5],
          [22, 15],
        ],
      },
    },
    source: "openmaptiles",
    "source-layer": "boundary",
    type: "line",
  },
  {
    filter: ["all", ["==", "$type", "Point"], ["==", "rank", 1]],
    id: "poi_label",
    layout: {
      "icon-size": 1,
      "text-anchor": "top",
      "text-field": "{name}",
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 8,
      "text-offset": [0, 0.5],
      "text-size": 11,
    },
    minzoom: 14,
    paint: {
      "text-color": "hsl(0, 0%,60%)",
      "text-halo-blur": 1,
      "text-halo-color": "hsla(0, 0%,0%, 0.75)",
      "text-halo-width": 1,
    },
    source: "openmaptiles",
    "source-layer": "poi",
    type: "symbol",
  },
  {
    filter: ["all", ["has", "iata"]],
    id: "airport-label",
    layout: {
      "icon-size": 1,
      "text-anchor": "top",
      "text-field": "{name}",
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 8,
      "text-offset": [0, 0.5],
      "text-size": 11,
    },
    minzoom: 10,
    paint: {
      "text-color": "hsl(0, 0%,60%)",
      "text-halo-blur": 1,
      "text-halo-color": "hsla(0, 0%,0%, 0.75)",
      "text-halo-width": 1,
    },
    source: "openmaptiles",
    "source-layer": "aerodrome_label",
    type: "symbol",
  },
  {
    filter: ["==", "$type", "LineString"],
    id: "road_major_label",
    layout: {
      "symbol-placement": "line",
      "text-field": "{name}",
      "text-font": ["Noto Sans Regular"],
      "text-letter-spacing": 0.1,
      "text-rotation-alignment": "map",
      "text-size": {
        base: 1.4,
        stops: [
          [10, 8],
          [20, 14],
        ],
      },
      "text-transform": "uppercase",
    },
    paint: {
      "text-color": "hsl(0, 0%,100%)",
      "text-halo-color": "hsl(0, 0%,0%)",
      "text-halo-width": 2,
    },
    source: "openmaptiles",
    "source-layer": "transportation_name",
    type: "symbol",
  },
  {
    filter: [
      "all",
      ["==", "$type", "Point"],
      ["!in", "class", "city", "state", "country", "continent"],
    ],
    id: "place_label_other",
    layout: {
      "text-anchor": "center",
      "text-field": "{name}",
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 6,
      "text-size": {
        stops: [
          [6, 10],
          [12, 14],
        ],
      },
    },
    minzoom: 8,
    paint: {
      "text-color": "hsl(0, 0%,75%)",
      "text-halo-blur": 0,
      "text-halo-color": "hsl(0, 0%,0%)",
      "text-halo-width": 2,
    },
    source: "openmaptiles",
    "source-layer": "place",
    type: "symbol",
  },
  {
    filter: ["all", ["==", "$type", "Point"], ["==", "class", "city"]],
    id: "place_label_city",
    layout: {
      "text-field": "{name}",
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 10,
      "text-size": {
        stops: [
          [3, 12],
          [8, 16],
        ],
      },
    },
    maxzoom: 16,
    paint: {
      "text-color": "hsl(0, 0%,100%)",
      "text-halo-blur": 0,
      "text-halo-color": "hsla(0, 0%,0%, 0.75)",
      "text-halo-width": 2,
    },
    source: "openmaptiles",
    "source-layer": "place",
    type: "symbol",
  },
  {
    filter: ["all", ["==", "$type", "Point"], ["==", "class", "country"], ["!has", "iso_a2"]],
    id: "country_label-other",
    layout: {
      "text-field": "{name:latin}",
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 10,
      "text-size": {
        stops: [
          [3, 12],
          [8, 22],
        ],
      },
    },
    maxzoom: 12,
    paint: {
      "text-color": "hsl(0, 0%,87%)",
      "text-halo-blur": 0,
      "text-halo-color": "hsla(0, 0%,0%, 0.75)",
      "text-halo-width": 2,
    },
    source: "openmaptiles",
    "source-layer": "place",
    type: "symbol",
  },
  {
    filter: ["all", ["==", "$type", "Point"], ["==", "class", "country"], ["has", "iso_a2"]],
    id: "country_label",
    layout: {
      "text-field": "{name:latin}",
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 10,
      "text-size": {
        stops: [
          [3, 12],
          [8, 22],
        ],
      },
    },
    maxzoom: 12,
    paint: {
      "text-color": "hsl(0, 0%,87%)",
      "text-halo-blur": 0,
      "text-halo-color": "hsla(0, 0%,0%, 0.75)",
      "text-halo-width": 2,
    },
    source: "openmaptiles",
    "source-layer": "place",
    type: "symbol",
  },
];

const style = {
  version: 8,
  name: "Basic preview",
  metadata: { "openmaptiles:version": "3.x" },
  sources,
  glyphs: `${TILE_SERVER_URL}/fonts/{fontstack}/{range}.pbf`,
  layers,
  id: "basic-preview",
};

export default style;
