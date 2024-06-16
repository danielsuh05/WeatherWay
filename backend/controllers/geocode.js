const { reverseGeocode } = require("../utils/geocode");

const routeController = require("express").Router();

routeController.get(
  "/:long&:lat",
  async (req, res) => {
    let location = await reverseGeocode(
      req.params.long,
      req.params.lat,
    );

    // If there was an error getting data from API, send status code 400
    if (location === undefined) {
      res
        .status(400)
        .send(
          "Error getting data from API, check if longitude, latitude, and time are in range."
        );
      return;
    }

    res.json(location);
  }
);

module.exports = routeController;
