const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

let getDiffHourly = (time) => {
  const currentDate = dayjs(),
    futureDate = dayjs(time);
  const diff = futureDate.diff(currentDate);

  return diff;
};

/*
take the time the user inputs
convert that time (dayjs) into gmt
subtract the first gmt time on open-meteo from the inputted time
convert that to hours
*/

/**
 *
 * @param {number} time The unix time for which we should find the `hourly.time` number for.
 * @returns {number} The hour in floating-point form for which we should obtain the weather for.
 */
let getHourlyJSONTime = (time) => {
  const timeGMT = dayjs.tz(time * 1000, "GMT");
  console.log(timeGMT.format("YYYY-MM-DDTHH:mm:ss Z"));

  // dayjs.startOf does not work and is an unmaintained package, so implement it ourselves
  const startOfDayGMT = timeGMT.hour(0).minute(0).second(0).millisecond(0);
  console.log(startOfDayGMT.format("YYYY-MM-DDTHH:mm:ss Z"));

  return timeGMT.diff(startOfDayGMT, 'h', true)
};

let getWeatherAtPointTime = ({ latitude, longitude }, time) => {
  console.log(latitude, longitude, time);
};

module.exports = {
  getWeatherAtPointTime,
  getDiffHourly,
  getHourlyJSONTime,
};
