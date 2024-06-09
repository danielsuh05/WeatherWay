const logger = require("./logger");

const requestLogger = (req, res, next) => {
  logger.info("Method: ", req.method);
  logger.info("Status: ", res.statusCode);
  logger.info("Path: ", req.path);
  logger.info("Body: ", req.body);
  logger.info("-----------");

  next();
};

module.exports = {
  requestLogger,
};
