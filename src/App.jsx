import { useRef, useEffect, useState } from "react";
import weatherService from "./services/weather";
import routeService from "./services/route";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";

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
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.75,
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

      let height = 20;
      let width = 20;

      console.log(markers);
      markers.forEach((point) => {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage = `url(https://cdn-icons-png.freepik.com/512/25/25613.png)`;
        el.style.width = `${height}px`;
        el.style.height = `${width}px`;
        el.style.backgroundSize = "100%";

        const root = createRoot(el);
        root.render(<div className="marker" />);

        new mapboxgl.Marker(el).setLngLat(point).setOffset([0, -height / 2]).addTo(map.current);

        console.log(point);

      });
    };

    map.current.on("load", () => {
      // make an initial directions request that
      // starts and ends at the same location
      getRoute([-74.864549, 42.632477], [-74.551546, 40.329155]);
      getDisplayMarkers([-74.864549, 42.632477], [-74.551546, 40.329155]);

      // this is where the code from the next step will go
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
