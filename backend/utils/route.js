const CheapRuler = require("cheap-ruler");
const { getWeatherAtPointTime } = require("./weather");
const { DateTime } = require("luxon");
const turf = require("@turf/turf");

require("dotenv").config();

const baseURL = "https://api.mapbox.com/directions/v5/mapbox/driving/";

let savedRoute;
let startCoord, endCoord;

let constructURL = (startLong, startLat, endLong, endLat) => {
  return (
    baseURL +
    `${startLong}%2C${startLat}%3B${endLong}%2C${endLat}?alternatives=false&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
  );
};

/**
 * @param {number} lat1 latitude of first point
 * @param {number} lon1 longitude of first point
 * @param {number} lat2 latitude of second point
 * @param {number} lon2 longitude of second point
 * @returns distance between the points in km
 */
let latLongDistance = (lat1, lon1, lat2, lon2) => {
  const ruler = new CheapRuler(lat1, "kilometers");
  const distance = ruler.distance([lat1, lon1], [lat2, lon2]);

  return distance;
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

  for (let i = 1; i < numMarkers; i += 1) {
    points.push(turf.along(line, i * multiplier, options).geometry.coordinates);
  }

  points.push(endCoord);

  let ret = [];

  // TODO: convert this into one api call into separate ones to not get limited
  await Promise.all(
    points.map(async (point) => {
      // TODO: if users want to change the time, then just change it here
      const time = DateTime.now().plus({
        seconds: getTimeOffsetAlongPath(point[0], point[1]),
      });
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
  const route = savedRoute;
  const legs = route.routes[0].legs;
  const pt = turf.point([longitude, latitude]);

  let sumDurations = 0;
  for (let i = 0; i < legs.length; i++) {
    for (let j = 0; j < legs[i].steps.length; j++) {
      const coordinates = legs[i].steps[j].geometry.coordinates;
      const overallDistance = legs[i].steps[j].distance;

      let estDistance = 0; // used for interpolation

      for (let k = 0; k < coordinates.length; k++) {
        let onLine = false;
        if (k > 0) {
          estDistance +=
            latLongDistance(
              coordinates[k][1],
              coordinates[k][0],
              coordinates[k - 1][1],
              coordinates[k - 1][0]
            ) * 1000;

          const line = turf.lineString([
            [coordinates[k][0], coordinates[k][1]],
            [coordinates[k - 1][0], coordinates[k - 1][1]],
          ]);

          onLine = turf.booleanPointOnLine(pt, line, { epsilon: 1e-5 });
        }
        if (onLine) {
          const t = estDistance / overallDistance;
          return sumDurations + legs[i].steps[j].duration * t;
        }
      }

      sumDurations += legs[i].steps[j].duration;
    }
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
 * Gets the JSON response of the route from MapBox API given a start and end (longitude, latitude)
 * @param {number} startLong starting longitude
 * @param {number} startLat starting latitude
 * @param {number} endLong ending longitude
 * @param {number} endLat ending latitude
 * @returns JSON response from MapBox API
 */
let getRoute = async (startLong, startLat, endLong, endLat) => {
  const url = constructURL(startLong, startLat, endLong, endLat);

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
