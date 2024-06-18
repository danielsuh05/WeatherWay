import axios from "axios";
const baseURL = "http://localhost:3001/api/route";

/**
 * Gets the route GeoJSON object to print to the map from the backend.
 * @param {number} startLong starting longitude
 * @param {number} startLat starting latitude
 * @param {number} endLong ending longitude
 * @param {number} endLat ending latitude
 * @param {string} time time in the format YYYY-MM-ddTHH:mm
 * @returns {GeoJSON} object that represents the route
 */
let getRoute = (startLong, startLat, endLong, endLat, time) => {
  const request = axios.get(
    baseURL + `/path/${startLong}&${startLat}&${endLong}&${endLat}&${time}`,
    { validateStatus: false }
  );
  return request
    .then((response) => {
      if (response.status >= 400) {
        throw new Error(response.data.msg);
      }

      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

/**
 * Gets the markers along the path and their respective information.
 * @returns {Array} array of markers
 */
let getMarkers = () => {
  const request = axios.get(baseURL + "/markers", { validateStatus: false });
  return request
    .then((response) => {
      if (response.status >= 400) {
        throw new Error(response.data.msg);
      }
      
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

/**
 * Gets the number of seconds from beginning to (long, lat)
 * @param {number} long longitude
 * @param {number} lat latitude
 * @returns {number} how many SECONDS it takes to get from the beginning of the path to the point defined by the parameters
 */
let getTimeOffset = (long, lat) => {
  const request = axios.get(baseURL + `/timeoffset/${long}&${lat}`, {
    validateStatus: false,
  });
  return request
    .then((response) => {
      if (response.status >= 400) {
        throw new Error(response.data.msg);
      }
      
      return response.data
    })
    .catch((error) => {
      throw error;
    });
};

export default {
  getRoute,
  getMarkers,
  getTimeOffset,
};
