const baseURL =
  "https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,cloud_cover,visibility,wind_speed_10m,wind_gusts_10m,uv_index,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=2";

let getWeatherScore = (weatherObject) => {
  return Math.floor(Math.random() * 101);
};

/**
 *
 * @param {number} latitude latitude to get weather for
 * @param {number} longitude longitude to get weather for
 * @param {DateTime} time time LOCALIZED to the specific (longitude, latitude).
 * @returns {object} the data object with the respective data
 */
let getWeatherAtPointTime = async (longitude, latitude, time) => {
  let createWeatherObject = (responseJSON, timeID) => {
    return {
      timezone: responseJSON.timezone,
      time: responseJSON.hourly.time[timeID],
      temperature_2m: responseJSON.hourly.temperature_2m[timeID],
      precipitation_probability:
        responseJSON.hourly.precipitation_probability[timeID],
      precipitation: responseJSON.hourly.precipitation[timeID],
      rain: responseJSON.hourly.rain[timeID],
      showers: responseJSON.hourly.showers[timeID],
      snowfall: responseJSON.hourly.snowfall[timeID],
      snow_depth: responseJSON.hourly.snow_depth[timeID],
      cloud_cover: responseJSON.hourly.cloud_cover[timeID],
      visibility: responseJSON.hourly.visibility[timeID],
      wind_speed_10m: responseJSON.hourly.wind_speed_10m[timeID],
      wind_gusts_10m: responseJSON.hourly.wind_gusts_10m[timeID],
      uv_index: responseJSON.hourly.uv_index[timeID],
      is_day: responseJSON.hourly.is_day[timeID],
    };
  };

  // TODO: there's a bottleneck here with the API, possibly fix later
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
      const findTime = time.toFormat("yyyy-MM-dd'T'HH:'00'");
      const timeID = responseJSON.hourly.time.findIndex((t) => t === findTime);

      if (timeID === -1) {
        console.log("Error processing the date.");
        return;
      }

      const beginWeather = createWeatherObject(responseJSON, timeID);
      const endWeather = createWeatherObject(responseJSON, timeID + 1);

      const t = time.minute / 60;

      const weatherObject = Object.keys(beginWeather).reduce((a, k) => {
        if(k === "timezone") {
          a[k] = beginWeather[k];
          return a;
        } else if(k === "time") {
          a[k] = time.toString();
          return a;
        }
        a[k] = beginWeather[k] + (endWeather[k] - beginWeather[k]) * t;
        return a;
      }, {})

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
