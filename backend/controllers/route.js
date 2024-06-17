const {getRoute, getTimeOffsetAlongPath, getMarkersAlongPath} = require("../utils/route");

const routeController = require("express").Router();

routeController.get("/path/:startLong&:startLat&:endLong&:endLat&:time", async (req, res) => {
  console.log('oeusntoehutsn');
  let route = await getRoute(req.params.startLong, req.params.startLat, req.params.endLong, req.params.endLat, req.params.time);

  // If there was an error getting data from API, send status code 400
  if (route === undefined) {
    res
      .status(400)
      .json({
        msg: "Error getting data from API, check if longitude, latitude, and time are in range."
      });
  }

  res.json(route);
});

routeController.get("/markers", async (req, res) => {
  let markers = await getMarkersAlongPath();

  if (markers === undefined) {
    res.status(400).send("Error getting data from API, check if longitude, latitude, and time are in range.")
    return;
  }

  res.json(markers)
});

routeController.get("/timeoffset/:longitude&:latitude", async (req, res) => {
  let offset = await getTimeOffsetAlongPath(req.params.longitude, req.params.latitude);

  if (offset === undefined) {
    res.status(400).send("Error getting data from API, check if longitude, and latitude are in range.")
    return;
  }

  res.json(offset);
})

module.exports = routeController;
