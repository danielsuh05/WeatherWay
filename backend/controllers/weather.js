const {getWeatherAtPointTime} = require('../utils/weather')

const weatherController = require('express').Router()

weatherController.get('/:latitude&:longitude&:time', (req, res) => {
  let location = {latitude: req.params.latitude, longitude: req.params.longitude}
  
  getWeatherAtPointTime(location, req.params.time)
})

module.exports = weatherController