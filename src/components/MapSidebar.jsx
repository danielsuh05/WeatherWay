import { useRef, useEffect, useState, useCallback } from "react";

import routeService from "../services/route";
import geocodeService from "../services/geocode";
import weatherService from "../services/weather";

import mapboxgl from "mapbox-gl";
import turf from "turf";

import ErrorMessage from "./ErrorMessage";
import Gradient from "javascript-color-gradient";
import { DateTime } from "luxon";
import { Sidebar, Menu } from "react-pro-sidebar";

/**
 * Transparent sidebar that has all of the user-input options
 * @param {MapBox} map the current map object that is being displayed on screen
 * @returns transparent sidebar react component
 */
let MapSidebar = ({ map }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [averageScore, setAverageScore] = useState(-1);
  const [startDate, setStartDate] = useState(
    DateTime.now().toFormat("yyyy'-'MM'-'dd'T'HH':'mm")
  );
  const [selectedOption, setSelectedOption] = useState("score");
  
  // we need to store the onClickRoute function in a ref because MapBox on/off requires the same function
  const storeFunctionRef = useRef(null);

  let displayDate = startDate;

  let onClickRoute = async (e) => {
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

    const time = DateTime.fromFormat(displayDate, "yyyy'-'MM'-'dd'T'HH':'mm")
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

                        if (k === "time") {
                          f = DateTime.fromISO(time).toFormat(
                            "yyyy'-'MM'-'dd' 'HH':'mm a"
                          );
                        }

                        return `<tr><td class="popup-item"><span class="popup-label">${name}:</span></td> <td>${f}</td></tr>`;
                      })
                      .join("")}
                  <table>
                </div>
              </div>
              `
      )
      .addTo(map.current);
  }

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
    if (key === "is_day") {
      return obj.weather.weatherDetails[key] === 1 ? "Day (0)" : "Night (-10)";
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

    map.current.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 150 }
    );
  };

  let getRoute = async (start, end, time) => {
    try {
      var json = await routeService.getRoute(
        start[0],
        start[1],
        end[0],
        end[1],
        time
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

    map.current.off("click", "route", storeFunctionRef.current);
    map.current.on("click", "route", onClickRoute);
    storeFunctionRef.current = onClickRoute;

    map.current.on("mouseenter", "route", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "route", () => {
      map.current.getCanvas().style.cursor = "default";
    });

    setErrorMessage("");
  };

  let firstRender = useRef(true);

  /**
   * Gets the markers (circles) for the route.
   */
  let getDisplayMarkers = useCallback(async () => {
    if (firstRender.current || !map.current.getLayer("route")) {
      firstRender.current = false;
      return;
    }
    
    const allLayers = map.current.getStyle().layers;
    const regexPattern = /^(marker|text).*/;

    allLayers.forEach((layer) => {
      if (regexPattern.test(layer.id)) {
        map.current.removeLayer(layer.id);
        map.current.removeSource(layer.id);
      }
    });
    
    let gradientArray;
    switch (selectedOption) {
      case "score":
        gradientArray = new Gradient()
          .setColorGradient("#ff5f58", "#ffbc2e", "#28c840")
          .setMidpoint(101)
          .getColors();
        break;
      case "temperature":
        gradientArray = new Gradient()
          .setColorGradient("#b8d4e3", "#ffbc2e", "#ff5f58")
          .setMidpoint(101)
          .getColors();
        break;
      case "wind":
        gradientArray = new Gradient()
          .setColorGradient("#DAE3E5", "#d3d3d3", "#2a2a2a")
          .setMidpoint(101)
          .getColors();
        break;
      case "precipitation":
        gradientArray = new Gradient()
          .setColorGradient("#BBD1EA", "#507DBC")
          .setMidpoint(101)
          .getColors();
        break;
    }

    try {
      var markers = await routeService.getMarkers();
    } catch (err) {
      setErrorMessage(err.message);
      return;
    }

    let sumScores = 0;

    markers.forEach((obj, i) => {
      let markerValue;

      switch (selectedOption) {
        case "score":
          markerValue = obj.weather.weatherScore.score;
          break;
        case "temperature":
          markerValue = obj.weather.weatherDetails.temperature_2m;
          break;
        case "wind":
          markerValue = obj.weather.weatherDetails.wind_speed_10m;
          break;
        case "precipitation":
          markerValue = obj.weather.weatherDetails.precipitation_probability;
          break;
      }

      markerValue = Math.max(Math.min(Math.round(markerValue), 100), 0);

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
          "circle-color": gradientArray[markerValue],
        },
      });

      sumScores += obj.weather.weatherScore.score;

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
          "text-field": `${markerValue}`,
          "text-justify": "center",
        },
      });

      map.current.moveLayer(`marker${i}`);
      map.current.moveLayer(`text${i}`);
    });

    setAverageScore(Number(sumScores / markers.length).toFixed(1));
    setErrorMessage("");
  }, [selectedOption]);

  useEffect(() => {
    getDisplayMarkers();
  }, [selectedOption, getDisplayMarkers]);

  let renderRoute = async (map, startPoint, endPoint) => {
    const allLayers = map.current.getStyle().layers;
    const regexPattern = /^(marker|text).*/;

    allLayers.forEach((layer) => {
      if (regexPattern.test(layer.id)) {
        map.current.removeLayer(layer.id);
        map.current.removeSource(layer.id);
      }
    });
    
    if (map.current.getLayer("route")) {
      map.current.removeLayer("route");
    }

    if (map.current.getSource("route")) {
      map.current.removeSource("route");
    }

    const popups = document.getElementsByClassName("mapboxgl-popup-content");

    if (popups.length) {
      popups[0].remove();
    }

    getRoute(startPoint, endPoint, startDate).then(() => {
      if (map.current.getLayer("route")) {
        getDisplayMarkers(startPoint, endPoint);
      }
    });
  };

  let handleSubmit = (e) => {
    map.current.on("click", "route", (e) => {e.preventDefault();});
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
      renderRoute(map, coord1, coord2);
    } else {
      setErrorMessage("Error parsing longitude, latitude. Check input values.");
    }
  };

  let onDateChange = async (e) => {
    const date = e.target.value;
    setStartDate(date);

    displayDate = date;

    console.log(displayDate);
  };

  let handleRadioClick = (e) => {
    e.preventDefault();
    setSelectedOption(e.target.id);
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
            Time of Departure:
            <input
              type="datetime-local"
              id="departure-time"
              value={startDate}
              min={DateTime.now().toFormat("yyyy'-'MM'-'dd'T'HH':'MM")}
              max={DateTime.now()
                .plus({ days: 3 })
                .toFormat("yyyy'-'MM'-'dd'T'HH':'MM")}
              onChange={onDateChange}
            />
            Marker Data:
            <div className="radio-form">
              <div
                className={
                  selectedOption !== "score"
                    ? "radio-button"
                    : "radio-button-selected"
                }
                id="score"
                onClick={handleRadioClick}
              >
                Score
              </div>
              <div
                className={
                  selectedOption !== "temperature"
                    ? "radio-button"
                    : "radio-button-selected"
                }
                id="temperature"
                onClick={handleRadioClick}
              >
                Temperature
              </div>
              <div
                className={
                  selectedOption !== "precipitation"
                    ? "radio-button"
                    : "radio-button-selected"
                }
                id="precipitation"
                onClick={handleRadioClick}
              >
                Precipitation %
              </div>
              <div
                className={
                  selectedOption !== "wind"
                    ? "radio-button"
                    : "radio-button-selected"
                }
                id="wind"
                onClick={handleRadioClick}
              >
                Wind Speed
              </div>
            </div>
            <input type="submit" value="Submit" />
            {errorMessage != "" && <ErrorMessage message={errorMessage} />}
            {averageScore != -1 && (
              <p>
                Average score: <strong>{averageScore}</strong>
              </p>
            )}
          </form>
        </Menu>
      </Sidebar>
    </>
  );
};

export default MapSidebar;