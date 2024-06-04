const { getWeatherAtPointTime } = require("../utils/weather");

const weatherController = require("express").Router();

weatherController.get("/:latitude&:longitude&:time", (req, res) => {
  let location = {
    latitude: req.params.latitude,
    longitude: req.params.longitude,
  };

  let hello = getWeatherAtPointTime(location, req.params.time);

  res.send(hello);
});

module.exports = weatherController;
