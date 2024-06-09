const {getRoute, getTimeOffsetAlongPath, getMarkersAlongPath} = require("../utils/route");

const routeController = require("express").Router();

routeController.get("/path/:startLong&:startLat&:endLong&:endLat", async (req, res) => {
  console.log(req.params)
  let route = await getRoute(req.params.startLong, req.params.startLat, req.params.endLong, req.params.endLat);

  // If there was an error getting data from API, send status code 202
  if (route === undefined) {
    res
      .status(202)
      .send(
        "Error getting data from API, check if longitude, latitude, and time are in range."
      );
  }

  res.send(route);
});

routeController.get(":endLong&:endLat&:endLong&:endLat&:long&:lat", async (req, res) => {
  let route = await getRoute(req.params.startLong, req.params.startLat, req.params.endLong, req.params.endLat);

  // If there was an error getting data from API, send status code 202
  if (route === undefined) {
    res
      .status(202)
      .send(
        "Error getting data from API, check if longitude and latitude are on the path."
      );
  }

  let time = getTimeOffsetAlongPath(req.params.long, req.params.lat, JSON.stringify(route));
  res.send(JSON.parse({time: time}));
});

routeController.get("/markers/:startLong&:startLat&:endLong&:endLat", async (req, res) => {
  let markers = await getMarkersAlongPath(req.params.startLong, req.params.startLat, req.params.endLong, req.params.endLat);

  console.log(markers);

  if (markers === undefined) {
    res.status(202).send("Error getting data from API, check if longitude, latitude, and time are in range.")
  }

  res.send(markers)
});

module.exports = routeController;
