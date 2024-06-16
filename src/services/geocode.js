import axios from "axios";
const baseURL = "http://localhost:3001/api/geocode";

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
