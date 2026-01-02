export const olaLightStyle = {
  version: 8,
  sources: {
    mapbox: {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8"
    }
  },
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#F5F7FA" }
    },
    {
      id: "water",
      type: "fill",
      source: "mapbox",
      "source-layer": "water",
      paint: { "fill-color": "#D6ECFF" }
    },
    {
      id: "road",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      paint: {
        "line-color": "#FFFFFF",
        "line-width": 3
      }
    },
    {
      id: "road-outline",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      paint: {
        "line-color": "#E6E9EF",
        "line-width": 1
      }
    }
  ]
};
