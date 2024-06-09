import { useRef, useEffect, useState } from "react";
import weatherService from "./services/weather";
import routeService from "./services/route";
import mapboxgl from "mapbox-gl";

function App() {
  // useEffect(() => {
  //   let time = "2024-06-07T23:00";
  //   console.log(
  //     weatherService.getWeatherAtPoint(30, 49, time).then((x) => console.log(x))
  //   );
  // });

  const mapContainer = useRef(null);
  const map = useRef(null);
  // const [lng, setLng] = useState(-98.5795);
  // const [lat, setLat] = useState(39.8283);
  // const [zoom, setZoom] = useState(3);

  // TODO: REMOVE, FOR TESTING PURPOSES
  const [lng, setLng] = useState(-74.734749);
  const [lat, setLat] = useState(41.70976);
  const [zoom, setZoom] = useState(6);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    let getRoute = async (start, end) => {
      const json = await routeService.getRoute(
        start[0],
        start[1],
        end[0],
        end[1]
      );

      const data = json.routes[0];
      const route = data.geometry.coordinates;
      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route,
        },
      };
      // if the route already exists on the map, we'll reset it using setData
      if (map.current.getSource("route")) {
        map.current.getSource("route").setData(geojson);
      }
      // otherwise, we'll make a new request
      else {
        map.current.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: geojson,
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#00539B",
            "line-width": 8,
            "line-opacity": 0.9,
          },
        });
      }
    };

    let getDisplayMarkers = async (start, end) => {
      const markers = await routeService.getMarkers(
        start[0],
        start[1],
        end[0],
        end[1]
      );

      console.log(markers);
      markers.forEach((point, i) => {
        map.current.addLayer({
          id: `marker${i}`,
          type: "circle",
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Point",
                    coordinates: point,
                  },
                },
              ],
            },
          },
          paint: {
            "circle-radius": 20,
            "circle-color": "red",
          },
        });
        map.current.addLayer({
          id: `text${i}`,
          type: "symbol",
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Point",
                    coordinates: point,
                  },
                },
              ],
            },
          },
          layout: {
            "text-field": "96",
            "text-justify": "center",
          },
        });
        map.current.moveLayer(`marker${i}`);
        map.current.moveLayer(`text${i}`);
      });
    };

    map.current.on("load", () => {
      getRoute([-74.864549, 42.632477], [-74.551546, 40.329155]).then(() => {
        getDisplayMarkers([-74.864549, 42.632477], [-74.551546, 40.329155]);
      });

    });
  });

  return (
    <div className="overall-container">
      <div className="content-container">
        {/* <div className="sidebar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div> */}
        <div ref={mapContainer} className="map-container" />
      </div>
    </div>
  );
}

export default App;
