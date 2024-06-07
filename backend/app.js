const express = require('express')
const cors = require('cors')
const middleware = require('./utils/middleware')

const weatherController = require('./controllers/weather')
const routeController = require('./controllers/route')

const app = express();
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/weather', weatherController)
app.use('/api/routes', routeController)

module.exports = app