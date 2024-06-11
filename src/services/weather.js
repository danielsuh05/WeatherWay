import axios from "axios";
const baseURL = "http://localhost:3001/api/weather";

const getWeatherAtPoint = (longitude, latitude, time) => {
  const request = axios.get(baseURL + `/${longitude}&${latitude}&${time}`);
  return request.then((response) => response.data);
};

export default {
  getWeatherAtPoint
};
