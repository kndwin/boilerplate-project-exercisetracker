'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
mongoose.connect(process.env.MLAB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(cors());

app.use(
    bodyParser.urlencoded({extended: false}),
    bodyParser.json()
);


app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// GET response
app.get("/api/exercise/log", function( req, res ) {
    res.json({ greetings: "hey" });
});

// POST response
app.post("/api/exercise/new-user", function( req, res ) {
    // update
    res.json({ 
        username: req.body.username,
        _id: 10000
    });
    err ? done(err) : done(null, count);
});

app.post("/api/exercise/add", function( req, res ) {
    res.json({ 
        userId: req.body.userId,
        description: req.body.description,
        duration: req.body.duration,
        date: '2020-05-05'
    });
    err ? done(err) : done(null, count);
});

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


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
