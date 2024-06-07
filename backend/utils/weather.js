const baseURL =
  "https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,cloud_cover,visibility,wind_speed_10m,wind_gusts_10m,uv_index,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1";

/**
 *
 * @param {number} latitude latitude to get weather for
 * @param {number} longitude longitude to get weather for
 * @param {string} time time LOCALIZED to the specific (longitude, latitude). Should be in format yyyy-MM-ddTHH:mm
 * @returns {object} the data object with the respective data
 */
let getWeatherAtPointTime = async (longitude, latitude, time) => {
  const url = `${baseURL}&latitude=${latitude}&longitude=${longitude}`;

  const weather = await fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      console.log(response);
      throw new Error("Error getting data from weather API.");
    })
    .then((responseJSON) => {
      const timeID = responseJSON.hourly.time.findIndex((t) => t === time);

      if(timeID === -1) {
        throw new Error("Error processing the date.")
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

      return weatherObject;
    })
    .catch((error) => {
      throw new Error(error);
    });

  return weather;
};

module.exports = {
  getWeatherAtPointTime,
};
