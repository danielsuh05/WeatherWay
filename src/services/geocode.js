import axios from "axios";
const baseURL = "http://localhost:3001/api/geocode";

let getReverseGeocode = (long, lat) => {
  const request = axios.get(baseURL + `/${long}&${lat}`);
  return request.then((response) => response.data);
};

export default {
  getReverseGeocode,
};
