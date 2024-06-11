const { reverseGeocode } = require("../utils/geocode");

const routeController = require("express").Router();

routeController.get(
  "/:long&:lat",
  async (req, res) => {
    let location = await reverseGeocode(
      req.params.long,
      req.params.lat,
    );

    // If there was an error getting data from API, send status code 202
    if (location === undefined) {
      res
        .status(202)
        .send(
          "Error getting data from API, check if longitude, latitude, and time are in range."
        );
    }

    res.json(location);
  }
);

module.exports = routeController;
