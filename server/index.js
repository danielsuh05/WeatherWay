const express = require('express')
const cors = require('cors')
const app = express();

app.use(cors())

let PORT = 3001
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})

app.get('/', (req, res) => {
  res.send('Hello from our server!')
})