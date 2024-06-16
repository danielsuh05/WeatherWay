/* eslint-disable react/prop-types */
import { useRef, useEffect, useState } from "react";

import routeService from "./services/route";
import geocodeService from "./services/geocode";
import weatherService from "./services/weather";

import mapboxgl from "mapbox-gl";
import Gradient from "javascript-color-gradient";
import turf from "turf";
import { DateTime } from "luxon";
import { Sidebar, Menu } from "react-pro-sidebar";

let ErrorMessage = ({ message }) => {
  return (
    <div className="error">
      <h3>Error:</h3>
      <p>{message}</p>
    </div>
  );
};

/**
 * Transparent sidebar that has all of the user-input options
 * @param {MapBox} map the current map object that is being displayed on screen
 * @returns transparent sidebar react component
 */
let MapSidebar = ({ map }) => {
  const [errorMessage, setErrorMessage] = useState("");

  let renderRoute = async (map, startPoint, endPoint) => {
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
      if (key === "timezone") {
        return obj.weather.weatherDetails[key];
      }
      if (key === "time") {
        return DateTime.fromFormat(
          obj.weather.weatherDetails[key],
          "yyyy-MM-dd'T'HH:mm:ss'.'SSSZZ"
        ).toLocaleString(DateTime.DATETIME_MED);
      }
      if (key === "is_day") {
        return obj.weather.weatherDetails[key] === 1
          ? "Day (0)"
          : "Night (-10)";
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
        unit +
        " (" +
        Number(obj.weather.weatherScore.contributions[key])
          .toFixed(0)
          .toString() +
        ")"
      );
    };

    let changeZoom = (map, geojson) => {
      const line = turf.lineString(geojson);
      const bbox = turf.bbox(line);
      
      
      map.current.fitBounds([
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ], {padding: 100});
    };

    let getRoute = async (start, end) => {
      try {
        var json = await routeService.getRoute(
          start[0],
          start[1],
          end[0],
          end[1]
        );
      } catch (err) {
        setErrorMessage(err.message);
        return;
      }

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

        changeZoom(map, geojson.geometry.coordinates);
      }

      map.current.on("click", "route", async (e) => {
        const coordinates = [e.lngLat.lng, e.lngLat.lat];

        try {
          var location = await geocodeService.getReverseGeocode(
            coordinates[0],
            coordinates[1]
          );
        } catch (err) {
          setErrorMessage(err.message);
          return;
        }

        try {
          var timeOffset = await routeService.getTimeOffset(
            coordinates[0],
            coordinates[1]
          );
        } catch (err) {
          setErrorMessage(err.message);
          return;
        }

        const time = DateTime.now()
          .plus({
            seconds: timeOffset,
          })
          .toISO();

        try {
          var weatherAtPoint = await weatherService.getWeatherAtPoint(
            coordinates[0],
            coordinates[1],
            time
          );
        } catch (err) {
          setErrorMessage(err.message);
          return;
        }
        const obj = { weather: weatherAtPoint };

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `
              <div class="popup-content">
                <div class="popup-header">
                  <h3>Weather Information for ${location}</h3>
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
      map.current.on("mouseenter", "route", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "route", () => {
        map.current.getCanvas().style.cursor = "fointer";
      });

      setErrorMessage("");
    };

    /**
     * Gets the markers (circles) for the route.
     */
    let getDisplayMarkers = async () => {
      const gradientArray = new Gradient()
        .setColorGradient("#ff5f58", "#ffbc2e", "#28c840")
        .setMidpoint(101)
        .getColors();

      try {
        var markers = await routeService.getMarkers();
      } catch (err) {
        setErrorMessage(err.message);
        return;
      }

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

      setErrorMessage("");
    };

    const allLayers = map.current.getStyle().layers;
    const regexPattern = /^(marker|text).*/;

    if (map.current.getLayer("route")) {
      console.log("removed layer route");
      map.current.removeLayer("route");
    }

    if (map.current.getSource("route")) {
      map.current.removeSource("route");
    }

    allLayers.forEach((layer) => {
      if (regexPattern.test(layer.id)) {
        console.log("removed layer", layer.id);
        map.current.removeLayer(layer.id);
        map.current.removeSource(layer.id);
      }
    });

    const popups = document.getElementsByClassName("mapboxgl-popup-content");
    console.log(popups);

    if (popups.length) {
      popups[0].remove();
    }

    getRoute(startPoint, endPoint).then(() => {
      if (map.current.getLayer("route")) {
        getDisplayMarkers(startPoint, endPoint);
      }
    });
  };

  let handleSubmit = (e) => {
    e.preventDefault();

    setErrorMessage("");

    const coord1 = document
      .getElementById("coord1")
      .value.replace(/\s/g, "")
      .split(",");
    const coord2 = document
      .getElementById("coord2")
      .value.replace(/\s/g, "")
      .split(",");

    const pattern = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;

    if (pattern.test(coord1) && pattern.test(coord2)) {
      console.log(coord1, coord2);
      renderRoute(map, coord1, coord2);
    } else {
      setErrorMessage("Error parsing longitude, latitude. Check input values.");
    }
  };

  return (
    <>
      <Sidebar className="sidebar">
        <Menu>
          <div className="title">
            <h2>WeatherWay</h2>
            <img src="../171845894336730124.png"></img>
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <label htmlFor="coord1">Starting point:</label>
            <input
              type="text"
              id="coord1"
              name="coord1"
              placeholder="longitude, latitude"
            />
            <label htmlFor="coord2">Destination:</label>
            <input
              type="text"
              id="coord2"
              name="coord2"
              placeholder="longitude, latitude"
            />
            <input type="submit" value="Submit" />
            {errorMessage != "" && <ErrorMessage message={errorMessage} />}
          </form>
        </Menu>
      </Sidebar>
    </>
  );
};

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);

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
  });

  return (
    <>
      <div className="overall-container">
        <div className="content-container">
          {/* <div className="sidebar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div> */}
          <div ref={mapContainer} className="map-container" />
        </div>
      </div>
      <MapSidebar map={map} />
    </>
  );
}

export default App;
