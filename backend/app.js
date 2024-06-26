const express = require("express");
const cors = require("cors");

const weatherController = require("./controllers/weather");
const routeController = require("./controllers/route");
const geocodeController = require("./controllers/geocode");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherController);
app.use("/api/route", routeController);
app.use("/api/geocode", geocodeController);

module.exports = app;
