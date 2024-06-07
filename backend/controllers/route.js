const {getRoute, getTimeOffsetAlongPath} = require("../utils/route");

const routeController = require("express").Router();

routeController.get(":startLong&:startLat&:endLong&:endLat", async (req, res) => {
  let route = await getRoute(req.params.startLong, req.params.startLat, req.params.endLong, req.params.endLat);

  // If there was an error getting data from API, send status code 202
  if (route === undefined) {
    res
      .status(202)
      .send(
        "Error getting data from API, check if latitude, longitude, and time are in range."
      );
  }

  res.send(route)
});

routeController.get(":endLong&:endLat&:endLong&:endLat&:long&:lat", async (req, res) => {
  let route = await getRoute(req.params.startLong, req.params.startLat, req.params.endLong, req.params.endLat);

  // If there was an error getting data from API, send status code 202
  if (route === undefined) {
    res
      .status(202)
      .send(
        "Error getting data from API, check if latitude, longitude, and time are in range."
      );
  }

  let time = getTimeOffsetAlongPath(req.params.long, req.params.lat, JSON.stringify(route));
  res.send(JSON.parse({time: time}));
});

module.exports = routeController;
