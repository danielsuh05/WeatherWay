import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

import MapSidebar from "./components/MapSidebar";

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // "Initializing your map here ensures that Mapbox GL JS will not try to render a map before React creates the element that contains the map."
  // https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    let longitude = -100.734749;
    let latitude = 41.07976;
    let zoom = 3;

    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: zoom,
    });
  });

  return (
    <>
      <div className="overall-container">
        <div className="content-container">
          <div ref={mapContainer} className="map-container" />
        </div>
      </div>
      <MapSidebar map={map} />
    </>
  );
}

export default App;
