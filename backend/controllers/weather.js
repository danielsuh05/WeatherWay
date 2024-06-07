const { getWeatherAtPointTime } = require("../utils/weather");

const weatherController = require("express").Router();

weatherController.get("/:latitude&:longitude&:time", async (req, res) => {
  let weather = await getWeatherAtPointTime(
    req.params.latitude,
    req.params.longitude,
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

  res.send(weather);
});

module.exports = weatherController;
