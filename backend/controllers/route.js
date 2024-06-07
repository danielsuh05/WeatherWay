const routeController = require("express").Router();

/**
 * latitude {number}
 * longitude {number}
 * time {string} - MUST be in form YYYY-MM-DDTHH:MM
 */
routeController.get(":startLong&:startLat&:endLong&:endLat", async (req, res) => {
  res.send("TODO: not finished");
});

module.exports = routeController;
