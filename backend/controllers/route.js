const routeController = require("express").Router();

/**
 * latitude {number}
 * longitude {number}
 * time {string} - MUST be in form YYYY-MM-DDTHH:MM
 */
routeController.get(":startLat&:startLong&:endLat&:endLong", async (req, res) => {
  res.send("TODO: not finished");
});

module.exports = routeController;
