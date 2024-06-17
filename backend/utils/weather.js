const { DateTime } = require("luxon");

const baseURL =
  "https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,cloud_cover,visibility,wind_speed_10m,wind_gusts_10m,uv_index,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=14";

let getWeatherScore = (weatherObject) => {
  let normalize = (value, avgRange, dangerousRange, safeRange) => {
    if (
      dangerousRange !== undefined &&
      value >= dangerousRange[0] &&
      value <= dangerousRange[1]
    ) {
      return 1;
    }
    if (
      safeRange !== undefined &&
      value >= safeRange[0] &&
      value <= safeRange[1]
    ) {
      return 0;
    }
    return (value - avgRange[0]) / (avgRange[1] - avgRange[0]);
  };

  const weights = {
    temperature_2m: 0.05,
    precipitation_probability: 0.2,
    precipitation: 0.5,
    rain: 0.25,
    showers: 0.25,
    snowfall: 0.25,
    snow_depth: 0.25,
    cloud_cover: 0.05,
    visibility: 0.5, // better if higher
    wind_speed_10m: 0.05,
    wind_gusts_10m: 0.05,
    uv_index: 0.001,
    is_day: 0.1,
  };

  const minMaxValues = {
    temperature_2m: [-22, 122],
    precipitation_probability: [0, 100],
    precipitation: [0, 4],
    rain: [0, 4],
    showers: [0, 4],
    snowfall: [0, 2],
    snow_depth: [0, 10],
    cloud_cover: [0, 100],
    visibility: [0, 100000],
    wind_speed_10m: [0, 100],
    wind_gusts_10m: [0, 100],
    uv_index: [0, 10],
    is_day: [0, 1],
  };

  const dangerousRanges = {
    precipitation: [4, 100],
    rain: [2, 100],
    showers: [2, 100],
    snowfall: [1, 100],
    snow_depth: [4, 100],
    cloud_cover: [50, 100],
    visibility: [0, 2000],
    wind_speed_10m: [30, 100],
    wind_gusts_10m: [45, 100],
    is_day: [-0.1, 0.5]
  };

  const safeRanges = {
    temperature_2m: [40, 90],
    cloud_cover: [0, 10],
    wind_speed_10m: [0, 25],
    wind_gusts_10m: [0, 35],
    uv_index: [0, 9],
    visibility: [3000, 100000000],
    is_day: [0.5, 1.1]
  };

  let normalizedScores = {};
  for (let key in weights) {
    if (key === "time" || key === "timezone") {
      continue;
    }
    normalizedScores[key] = normalize(
      weatherObject[key],
      minMaxValues[key],
      dangerousRanges[key],
      safeRanges[key]
    );
  }

  let safetyScore = 1;

  let safetyObj = {};

  for (let key in weatherObject) {
    if (key === "time" || key === "timezone") {
      safetyObj[key] = weatherObject[key];
      continue;
    }
    safetyScore -= normalizedScores[key] * weights[key];
    safetyObj[key] = -normalizedScores[key] * weights[key] * 100;
  }

  safetyScore = safetyScore * 100;
  return {
    score: Math.floor(Math.min(Math.max(0, safetyScore), 100)),
    contributions: safetyObj,
  };
};

/**
 *
 * @param {number} latitude latitude to get weather for
 * @param {number} longitude longitude to get weather for
 * @param {string} time time LOCALIZED to the specific (longitude, latitude).
 * @returns {object} the data object with the respective data
 */
let getWeatherAtPointTime = async (longitude, latitude, time) => {
  let createWeatherObject = (responseJSON, timeID) => {
    return {
      timezone: responseJSON.timezone,
      time: responseJSON.hourly.time[timeID], // iso8601
      temperature_2m: responseJSON.hourly.temperature_2m[timeID], // F
      precipitation_probability:
        responseJSON.hourly.precipitation_probability[timeID], // %
      precipitation: responseJSON.hourly.precipitation[timeID], // in
      rain: responseJSON.hourly.rain[timeID], // in
      showers: responseJSON.hourly.showers[timeID], // in
      snowfall: responseJSON.hourly.snowfall[timeID], // in
      snow_depth: responseJSON.hourly.snow_depth[timeID], // in
      cloud_cover: responseJSON.hourly.cloud_cover[timeID], // %
      visibility: responseJSON.hourly.visibility[timeID], // ft
      wind_speed_10m: responseJSON.hourly.wind_speed_10m[timeID], // mp/h
      wind_gusts_10m: responseJSON.hourly.wind_gusts_10m[timeID], // mp/h
      uv_index: responseJSON.hourly.uv_index[timeID], // uv value
      is_day: responseJSON.hourly.is_day[timeID], // 1 = day, 0 = night
    };
  };

  // TODO: there's a bottleneck here with the API, possibly fix with one weather API call
  const url = `${baseURL}&latitude=${latitude}&longitude=${longitude}`;

  const weather = await fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      console.log("Error getting data from weather API");
      return;
    })
    .then((responseJSON) => {
      const timeObj = DateTime.fromISO(time);
      const findTime = timeObj.toFormat("yyyy-MM-dd'T'HH:'00'");
      const timeID = responseJSON.hourly.time.findIndex((t) => t === findTime);

      if (timeID === -1) {
        console.log("Error processing the date.");
        return;
      }

      const beginWeather = createWeatherObject(responseJSON, timeID);
      const endWeather = createWeatherObject(responseJSON, timeID + 1);

      const t = timeObj.minute / 60;

      // interpolate between beginWeather and endWeather using simple lerp
      const weatherObject = Object.keys(beginWeather).reduce((a, k) => {
        if (k === "timezone") {
          a[k] = beginWeather[k];
          return a;
        } else if (k === "time") {
          a[k] = time.toString();
          return a;
        }
        a[k] = beginWeather[k] + (endWeather[k] - beginWeather[k]) * t;
        return a;
      }, {});

      const score = getWeatherScore(weatherObject);

      return {
        weatherDetails: weatherObject,
        weatherScore: score,
      };
    })
    .catch((error) => {
      console.log(error);
      return;
    });

  return weather;
};

module.exports = {
  getWeatherAtPointTime,
};
