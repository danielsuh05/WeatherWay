const CheapRuler = require("cheap-ruler");
const utils = require("../utils/utils");

require("dotenv").config();

const baseURL = "https://api.mapbox.com/directions/v5/mapbox/driving/";

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
let getMarkers = (routeGeometry) => {
  let routeLength = 0;
  for (let i = 0; i < routeGeometry.length - 1; i++) {
    let point1 = routeGeometry[i],
      point2 = routeGeometry[i + 1];
    routeLength += latLongDistance(point1[0], point1[1], point2[0], point2[1]);
  }

  const numMarkers = Math.max(5, Math.floor(routeLength / 100)); // assuming ~100 km/h for long drives
  const distanceBetweenMarkers = routeLength / numMarkers;

  let distanceSum = 0;
  let ret = [];

  for (let i = 0; i < routeGeometry.length - 1; i++) {
    const point1 = routeGeometry[i],
      point2 = routeGeometry[i + 1];
    const curDistance = latLongDistance(
      point1[0],
      point1[1],
      point2[0],
      point2[1]
    );

    if (distanceSum + curDistance >= distanceBetweenMarkers) {
      ret.push([point2[0], point2[1]]);
      distanceSum = 0;
    } else {
      distanceSum += curDistance;
    }
  }

  return ret;
};

/**
 * Gets the LOCAL time along the route. `getRoute` will always be called before this method is run.
 * @param {number} longitude longitude to get info from
 * @param {number} latitude latitude to get info from
 * @returns object containing LOCAL time when they will arrive along the path
 */
let getTimeOffsetAlongPath = (longitude, latitude, routeString) => {
  // TODO: optimize this with cache stuff
  let epsilonEqual = (a, b) => {
    return Math.abs(a - b) < utils.EPSILON;
  };

  // we can use the cache results because `getRoute` will be called before this.
  // TODO: FIX THE LOCALSTORAGE CACHE ISSUES
  if (routeString) {
    const route = JSON.parse(routeString);

    const legs = route.routes[0].legs;

    let sumDurations = 0;
    for (let i = 0; i < legs.length; i++) {
      for (let j = 0; j < legs[i].steps.length; j++) {
        const coordinates = legs[i].steps[j].geometry.coordinates;
        let curDistance = 0;
        const overallDistance = legs[i].steps[j].distance;

        for (let k = 0; k < coordinates.length; k++) {
          if (k > 0) {
            curDistance +=
              latLongDistance(
                coordinates[k][1],
                coordinates[k][0],
                coordinates[k - 1][1],
                coordinates[k - 1][0]
              ) * 1000; // convert to meters
          }
          if (
            epsilonEqual(coordinates[k][0], longitude) &&
            epsilonEqual(coordinates[k][1], latitude)
          ) {
            const t = curDistance / overallDistance;
            return sumDurations + legs[i].steps[j].duration * t;
          }
        }

        sumDurations += legs[i].steps[j].duration;
      }
    }
  } else {
    throw new Error("Error: route was not cached");
  }

  throw new Error(`Coordinate ${longitude}, ${latitude} not found in steps.`);
};

/**
 * Gets the JSON response + markers along the route from MapBox API given a start and end (longitude, latitude)
 * @param {number} startLong starting longitude
 * @param {number} startLat starting latitude
 * @param {number} endLong ending longitude
 * @param {number} endLat ending latitude
 * @returns JSON response and markers from MapBox API
 */
let getRoute = async (startLong, startLat, endLong, endLat) => {
  const url = constructURL(startLong, startLat, endLong, endLat);

  const route = await fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(`Error fetching from route API: ${response}`);
    })
    .then((responseJSON) => {
      if (responseJSON.code !== "Ok") {
        throw new Error(
          `Error fetching from route API: ${responseJSON.message}`
        );
      }

      const markers = getMarkers(responseJSON.routes[0].geometry.coordinates);

      return {
        path: responseJSON,
        markers: markers,
      };
    })
    .catch((error) => {
      throw new Error(error);
    });

  return route;
};

module.exports = {
  getRoute,
  getTimeOffsetAlongPath,
};
