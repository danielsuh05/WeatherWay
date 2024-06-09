const baseURL =
  "https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,cloud_cover,visibility,wind_speed_10m,wind_gusts_10m,uv_index,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1";

let getWeatherScore = async (weatherObject) => {
  // const weatherObject = {
  //   timezone: responseJSON.timezone,
  //   time: responseJSON.hourly.time[timeID],
  //   temperature_2m: responseJSON.hourly.temperature_2m[timeID],
  //   precipitation_probability:
  //     responseJSON.hourly.precipitation_probability[timeID],
  //   precipitation: responseJSON.hourly.precipitation[timeID],
  //   rain: responseJSON.hourly.rain[timeID],
  //   showers: responseJSON.hourly.showers[timeID],
  //   snowfall: responseJSON.hourly.snowfall[timeID],
  //   snow_depth: responseJSON.hourly.snow_depth[timeID],
  //   cloud_cover: responseJSON.hourly.cloud_cover[timeID],
  //   visibility: responseJSON.hourly.visibility[timeID],
  //   wind_speed_10m: responseJSON.hourly.wind_speed_10m[timeID],
  //   wind_gusts_10m: responseJSON.hourly.wind_gusts_10m[timeID],
  //   uv_index: responseJSON.hourly.uv_index[timeID],
  //   is_day: responseJSON.hourly.is_day[timeID],
  // };

  // Define weights for each parameter
  const weights = {
    temperature: 0.0,
    precipitationProbability: 0.2,
    precipitation: 0.3,
    rain: 0.1,
    showers: 0.2,
    snowfall: 0.4,
    snowDepth: 0.4,
    cloudCover: 0.05,
    visibility: 0.4,
    windSpeed: 0.05,
    windGusts: 0.05,
    uvIndex: 0.0,
    isDay: 0.15,
  };

  // Normalize each parameter to a 0-1 scale (assuming some reasonable max values)
  const maxValues = {
    temperature: 122, 
    precipitationProbability: 100, 
    precipitation: 2, 
    rain: 2, 
    showers: 2, 
    snowfall: 2, 
    snowDepth: 2, 
    cloudCover: 100, 
    visibility: 10000, 
    windSpeed: 100, 
    windGusts: 100, 
    uvIndex: 11, 
    isDay: 1 
  };

  // Normalize function
  function normalize(value, max) {
    return Math.min(value / max, 1);
  }

  const normalized = {
    temperature: normalize(weatherObject.temperature_2m, maxValues.temperature),
    precipitationProbability: normalize(weatherObject.precipitation_probability, maxValues.precipitationProbability),
    precipitation: normalize(weatherObject.precipitation, maxValues.precipitation),
    rain: normalize(weatherObject.rain, maxValues.rain),
    showers: normalize(weatherObject.showers, maxValues.showers),
    snowfall: normalize(weatherObject.snowfall, maxValues.snowfall),
    snowDepth: normalize(weatherObject.snow_depth, maxValues.snowDepth),
    cloudCover: normalize(weatherObject.cloud_cover, maxValues.cloudCover),
    visibility: normalize(weatherObject.visibility, maxValues.visibility),
    windSpeed: normalize(weatherObject.wind_speed_10m, maxValues.windSpeed),
    windGusts: normalize(weatherObject.wind_gusts_10m, maxValues.windGusts),
    uvIndex: normalize(weatherObject.uv_index, maxValues.uvIndex),
    isDay: normalize(weatherObject.is_day, maxValues.isDay)
  };

  let score = 0;
  score += weights.temperature * normalized.temperature;
  score += -weights.precipitationProbability * normalized.precipitationProbability;
  score += -weights.precipitation * normalized.precipitation;
  score += -weights.rain * normalized.rain;
  score += -weights.showers * normalized.showers;
  score += -weights.snowfall * normalized.snowfall;
  score += -weights.snowDepth * normalized.snowDepth;
  score += -weights.cloudCover * normalized.cloudCover;
  score += weights.visibility * normalized.visibility;
  score += -weights.windSpeed * normalized.windSpeed;
  score += -weights.windGusts * normalized.windGusts;
  score += weights.uvIndex * normalized.uvIndex;
  score += -weights.isDay * normalized.isDay;

  // Adjust score to be out of 100
  score = score * 100;

  // Ensure score is within range 0-100
  score = Math.max(0, Math.min(score, 100));
  console.log('score', score);

  return score;
};

/**
 *
 * @param {number} latitude latitude to get weather for
 * @param {number} longitude longitude to get weather for
 * @param {string} time time LOCALIZED to the specific (longitude, latitude). Should be in format yyyy-MM-ddTHH:mm
 * @returns {object} the data object with the respective data
 */
let getWeatherAtPointTime = async (longitude, latitude, time) => {
  console.log(time);

  const url = `${baseURL}&latitude=${latitude}&longitude=${longitude}`;
  console.log(url);

  const weather = await fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      console.log("Error getting data from weather API");
      return;
    })
    .then((responseJSON) => {
      const timeID = responseJSON.hourly.time.findIndex((t) => t === time);

      if (timeID === -1) {
        console.log("Error processing the date.");
        return;
      }

      const weatherObject = {
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

      getWeatherScore(weatherObject);

      return weatherObject;
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
