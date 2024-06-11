import { useRef, useEffect, useState } from "react";
import routeService from "./services/route";
import mapboxgl from "mapbox-gl";
import Gradient from "javascript-color-gradient";
import { DateTime } from "luxon";

function App() {
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

    const formatDict = {
      timezone: "🕚 Timezone",
      time: "⏰ Local Time",
      temperature_2m: "🌡️ Temperature",
      precipitation_probability: "🌧️ Precipitation Percentage",
      precipitation: "💧 Precipitation",
      rain: "🌦️ Rainfall",
      showers: "🌧️ Showers",
      snowfall: "🌨️ Snowfall",
      snow_depth: "☃️ Snow Depth",
      cloud_cover: "☁️ Cloud Cover Percentage",
      visibility: "👁️ Visibility",
      wind_speed_10m: "🍃 Wind speed",
      wind_gusts_10m: "️💨 Wind gusts",
      uv_index: "☀️ UV Index",
      is_day: "🌙 Time of Day",
    };

    let formatWeatherValues = (key, obj) => {
      // console.log(obj);
      // return obj.weather.weatherDetails[key];
      if (key === "timezone") {
        return obj.weather.weatherDetails[key];
      }
      if (key === "time") {
        console.log(obj.weather.weatherDetails[key]);
        return DateTime.fromFormat(
          obj.weather.weatherDetails[key],
          "yyyy-MM-dd'T'HH:mm:ss'.'SSSZZ"
        ).toLocaleString(DateTime.DATETIME_MED);
      }
      if (key === "is_day") {
        return obj.weather.weatherDetails[key] === 1 ? "Day" : "Night";
      }
      let unit = "";
      if (key === "temperature_2m") {
        unit = "°F";
      }
      if (key === "precipitation_probability" || key === "cloud_cover") {
        unit = "%";
      }
      if (
        key === "precipitation" ||
        key === "rain" ||
        key === "showers" ||
        key === "snowfall" ||
        key === "snow_depth"
      ) {
        unit = "in";
      }
      if (key === "visibility") {
        unit = "ft";
      }
      if (key === "wind_speed_10m" || key === "wind_gusts_10m") {
        unit = "mp/h";
      }

      return (
        Number(obj.weather.weatherDetails[key]).toFixed(2).toString() +
        " " +
        unit
      );
    };

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
      if (map.current.getSource("route")) {
        map.current.getSource("route").setData(geojson);
      } else {
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

    let getDisplayMarkers = async () => {
      const gradientArray = new Gradient()
        .setColorGradient("#ff5f58", "#ffbc2e", "#28c840")
        .setMidpoint(101)
        .getColors();

      const markers = await routeService.getMarkers();

      markers.forEach((obj, i) => {
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
                    coordinates: obj.point,
                  },
                },
              ],
            },
          },
          paint: {
            "circle-radius": 20,
            "circle-color": gradientArray[obj.weather.weatherScore.score],
          },
        });

        map.current.on("click", `marker${i}`, (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // TODO: make it show where you just clicked
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `
              <div class="popup-content">
                <div class="popup-header">
                  <h3>Weather Information</h3>
                </div>
                <div class="popup-body">
                  <table>
                    ${Object.keys(obj.weather.weatherScore.contributions)
                      .map((k) => {
                        let f = formatWeatherValues(k, obj);
                        let name = formatDict[k];
                        return `<tr><td class="popup-item"><span class="popup-label">${name}:</span></td> <td>${f}</td></tr>`;
                      })
                      .join("")}
                  <table>
                </div>
              </div>
              `
            )
            .addTo(map.current);
        });

        map.current.on("mouseenter", `marker${i}`, () => {
          map.current.getCanvas().style.cursor = "pointer";
        });

        // Change it back to a pointer when it leaves.
        map.current.on("mouseleave", `marker${i}`, () => {
          map.current.getCanvas().style.cursor = "";
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
                    coordinates: obj.point,
                  },
                },
              ],
            },
          },
          layout: {
            "text-field": `${obj.weather.weatherScore.score}`,
            "text-justify": "center",
          },
        });
        map.current.moveLayer(`marker${i}`);
        map.current.moveLayer(`text${i}`);
      });
    };

    map.current.on("load", () => {
      const point1 = [-74.864549, 42.632477];
      const point2 = [-74.551546, 40.329155];
      // const point2 = [-118.2426, 34.0549];
      // const point2 = [-149.8997, 61.2176];
      getRoute(point1, point2).then(() => {
        getDisplayMarkers(point1, point2);
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
