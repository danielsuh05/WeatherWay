import axios from "axios";
const baseURL = "http://localhost:3001/api/weather";

/**
 * Gets the weather at a certain point using the backend.
 * @param {number} longitude longitude of point
 * @param {number} latitude latitude of point
 * @param {string} time time in the format YYYY-MM-ddTHH:mm
 * @returns {object} the weather object at that point
 */
const getWeatherAtPoint = (longitude, latitude, time) => {
  const request = axios.get(baseURL + `/${longitude}&${latitude}&${time}`, {
    validateStatus: false,
  });
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

export default {
  getWeatherAtPoint,
};
