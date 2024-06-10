import axios from "axios";
const baseURL = "http://localhost:3001/api/route";

const getRoute = (startLong, startLat, endLong, endLat) => {
  const request = axios.get(baseURL + `/path/${startLong}&${startLat}&${endLong}&${endLat}`);
  return request.then((response) => response.data);
};

const getMarkers = () => {
  const request = axios.get(baseURL + "/markers");
  return request.then((response) => response.data);
};

const getTimeOffset = (long, lat) => {
    const request = axios.get(baseURL + `/timeoffset/${long}&${lat}`)
    return request.then((response) => response.data);
}

export default {
  getRoute,
  getMarkers,
  getTimeOffset
};
