let config = require("./utils/config");
let PORT = config.PORT;
let app = require('./app')

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
