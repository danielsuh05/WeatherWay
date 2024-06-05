const { getWeatherAtPointTime } = require("../utils/weather");

const weatherController = require("express").Router();

/**
 * latitude {number}
 * longitude {number}
 * time {string} - MUST be in form YYYY-MM-DDTHH:MM
 */
weatherController.get("/:latitude&:longitude&:time", async (req, res) => {
  let weather = await getWeatherAtPointTime(
    req.params.latitude,
    req.params.longitude,
    req.params.time
  );

  // If there was an error getting data from API, send status code 202
  if (weather === undefined) {
    console.log("hello");
    res
      .status(202)
      .send(
        "Error getting data from API, check if latitude, longitude, and time are in range."
      );
  }

  res.send(weather);
});

module.exports = weatherController;
