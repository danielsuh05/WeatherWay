import axios from "axios";
const baseURL = "http://localhost:3001/api/route";

const getRoute = (startLong, startLat, endLong, endLat) => {
  const request = axios.get(baseURL + `/path/${startLong}&${startLat}&${endLong}&${endLat}`);
  return request.then((response) => response.data);
};

export default {
  getRoute
};
