const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const User = require('./userModel.js');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Connect to MongoDB
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect(process.env.MLAB_URI, options); 

// Initialize Express
app.use(
  bodyParser.urlencoded({extended: false}),
  bodyParser.json(),
  cors(),
  express.static('public')
);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Load routes
require("./routes.js")(app);

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'});
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }
  res.status(errCode).type('txt')
    .send(errMessage);
});


// Start Express Server
const server = app.listen(process.env.PORT || 3000, () => {
  const { port, address, } = server.address()
  console.info(`Express server started on port ${address}:${port}`)
});
