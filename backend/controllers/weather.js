const { getWeatherAtPointTime } = require("../utils/weather");

const weatherController = require("express").Router();

weatherController.get("/:longitude&:latitude&:time", async (req, res) => {
  let weather = await getWeatherAtPointTime(
    req.params.longitude,
    req.params.latitude,
    req.params.time
  );

  // If there was an error getting data from API, send status code 202
  if (weather === undefined) {
    res
      .status(202)
      .send(
        "Error getting data from API, check if latitude, longitude, and time are in range."
      );
  }

  res.json(weather);
});

module.exports = weatherController;
