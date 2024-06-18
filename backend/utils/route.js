const { getWeatherAtPointTime } = require("./weather");
const { DateTime } = require("luxon");
const turf = require("@turf/turf");

require("dotenv").config();

const baseURL = "https://api.mapbox.com/directions/v5/mapbox/driving/";

let savedRoute, startTime;
let startCoord, endCoord;

let constructURL = (startLong, startLat, endLong, endLat, time) => {
  return (
    baseURL +
    `${startLong}%2C${startLat}%3B${endLong}%2C${endLat}?depart_at=${time}&annotations=duration&alternatives=false&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
  );
};

/**
 * Gets the markers along the path every ~1 hour
 * @param {Array} routeGeometry array of points in the form of (longitude, latitude) that form the geometry of the path
 * @returns {Array} array of points (longitude, latitude) markers along the path
 */
let getMarkers = async () => {
  const route = savedRoute;
  const line = turf.lineString(route.routes[0].geometry.coordinates);

  let points = [];

  var options = { units: "kilometers" };

  points.push(startCoord);

  const len = turf.length(line, options);
  const numMarkers = Math.max(5, len / 150);
  const multiplier = len / 150 >= 5 ? 150 : len / 5;

  // Gets the points at a certain distance from the starting point (should be ~equidistant)
  for (let i = 1; i < numMarkers; i += 1) {
    points.push(turf.along(line, i * multiplier, options).geometry.coordinates);
  }

  points.push(endCoord);

  let ret = [];

  await Promise.all(
    points.map(async (point) => {
      const time = DateTime.fromFormat(startTime, "yyyy'-'MM'-'dd'T'HH':'mm").plus({
        seconds: getTimeOffsetAlongPath(point[0], point[1]),
      });
      
      // Gets the weather at the point and at the time at which they reach that point
      const weatherObj = await getWeatherAtPointTime(point[0], point[1], time);

      ret.push({ point: point, weather: weatherObj });
    })
  );

  return ret;
};

/**
 * Gets the LOCAL time along the route. `getRoute` will always be called before this method is run.
 * @param {number} longitude longitude to get info from
 * @param {number} latitude latitude to get info from
 * @returns {number} how long it will take to get to that point along the route
 */
let getTimeOffsetAlongPath = (longitude, latitude) => {
  const durations = savedRoute.routes[0].legs[0].annotation.duration;
  const coordinates = savedRoute.routes[0].geometry.coordinates;
  const pt = turf.point([longitude, latitude]);

  let sumDurations = 0;

  for(let i = 1; i < coordinates.length; i++) {
    const line = turf.lineString([
      [coordinates[i][0], coordinates[i][1]],
      [coordinates[i - 1][0], coordinates[i - 1][1]]
    ]);

    const isOnLine = turf.booleanPointOnLine(pt, line, {epsilon: 1e-5});

    if(isOnLine) {
      return sumDurations;
    }

    sumDurations += durations[i - 1];
  }

  if (longitude === startCoord[0] && latitude == startCoord[1]) {
    return 0;
  }

  if (longitude === endCoord[0] && latitude == endCoord[1]) {
    return sumDurations;
  }

  console.log(`Coordinate ${longitude}, ${latitude} not found in steps.`);
};

/**
 * Gets the JSON response of the route from MapBox API given a start and end (longitude, latitude).
 * @param {number} startLong starting longitude
 * @param {number} startLat starting latitude
 * @param {number} endLong ending longitude
 * @param {number} endLat ending latitude
 * @param {string} time time in the format YYYY-MM-ddTHH:mm
 * @returns JSON response from MapBox API
 */
let getRoute = async (startLong, startLat, endLong, endLat, time) => {
  const url = constructURL(startLong, startLat, endLong, endLat, time);

  const route = await fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }

      console.log(`Error fetching from route API: ${response}`);
      return;
    })
    .then((responseJSON) => {
      if (responseJSON.code !== "Ok") {
        console.log(`Error fetching from route API: ${responseJSON.message}`);
        return;
      }

      return responseJSON;
    })
    .catch((error) => {
      console.log(error);
      return;
    });

  if (route) {
    savedRoute = route;
    startTime = time;
    startCoord = [startLong, startLat];
    endCoord = [endLong, endLat];
  }

  return route;
};

/**
 * Gets the markers along the route from MapBox API given a start and end (longitude, latitude)
 * @param {number} startLong starting longitude
 * @param {number} startLat starting latitude
 * @param {number} endLong ending longitude
 * @param {number} endLat ending latitude
 * @returns markers along route from MapBox API
 */
let getMarkersAlongPath = async () => {
  const markers = await getMarkers();
  return markers;
};

module.exports = {
  getRoute,
  getTimeOffsetAlongPath,
  getMarkersAlongPath,
};
