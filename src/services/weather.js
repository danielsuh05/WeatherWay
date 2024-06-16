import axios from "axios";
const baseURL = "http://localhost:3001/api/weather";

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
