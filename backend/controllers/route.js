const {getRoute, getTimeOffsetAlongPath, getMarkersAlongPath} = require("../utils/route");

const routeController = require("express").Router();

routeController.get("/path/:startLong&:startLat&:endLong&:endLat", async (req, res) => {
  let route = await getRoute(req.params.startLong, req.params.startLat, req.params.endLong, req.params.endLat);

  // If there was an error getting data from API, send status code 202
  if (route === undefined) {
    res
      .status(202)
      .send(
        "Error getting data from API, check if longitude, latitude, and time are in range."
      );
  }

  res.json(route);
});

routeController.get("/markers", async (req, res) => {
  let markers = await getMarkersAlongPath();

  console.log(markers);

  if (markers === undefined) {
    res.status(202).send("Error getting data from API, check if longitude, latitude, and time are in range.")
  }

  res.json(markers)
});

routeController.get("/timeoffset/:longitude&:latitude", async (req, res) => {
  let offset = await getTimeOffsetAlongPath(req.params.longitude, req.params.latitude);

  if (offset === undefined) {
    res.status(202).send("Error getting data from API, check if longitude, and latitude are in range.")
  }

  res.json(offset);
})

module.exports = routeController;
