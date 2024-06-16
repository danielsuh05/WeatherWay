import axios from "axios";
const baseURL = "http://localhost:3001/api/route";

let getRoute = (startLong, startLat, endLong, endLat) => {
  const request = axios.get(
    baseURL + `/path/${startLong}&${startLat}&${endLong}&${endLat}`,
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

let getTimeOffset = (long, lat) => {
  const request = axios.get(baseURL + `/timeoffset/${long}&${lat}`, {
    validateStatus: false,
  });
  return request
    .then((response) => {
      if (response.status >= 400) {
        throw new Error(response.data.msg);
      }
      
      response.data
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
