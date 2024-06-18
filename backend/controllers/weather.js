const { getWeatherAtPointTime } = require("../utils/weather");

const weatherController = require("express").Router();

/**
 * Given the longitude, latitude, and time, get the weather object at that point. 
 */
weatherController.get("/:longitude&:latitude&:time", async (req, res) => {
  let weather = await getWeatherAtPointTime(
    req.params.longitude,
    req.params.latitude,
    req.params.time
  );

  // If there was an error getting data from API, send status code 400
  if (weather === undefined) {
    res
      .status(400)
      .send(
        "Error getting data from API, check if latitude, longitude, and time are in range."
      );
    return;
  }

  res.json(weather);
});

module.exports = weatherController;
