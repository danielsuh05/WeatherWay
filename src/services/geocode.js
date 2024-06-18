import axios from "axios";
const baseURL = "http://localhost:3001/api/geocode";

/**
 * Gets the name of the city/country/state for the inputted (long, lat). Runs Reverse geocode on backend from MapBox.
 * @param {number} long longitude
 * @param {number} lat latitude
 * @returns {string} the name of the city/country/state the the longitude and latitude belong to
 */
let getReverseGeocode = (long, lat) => {
  const request = axios.get(baseURL + `/${long}&${lat}`, {
    validateStatus: false
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
  getReverseGeocode,
};
