'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

mongoose.connect( process.env.MLAB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Schema = mongoose.Schema;

const usersSchema = new Schema ({
    "user": {
        type: String,
        required: true
    },
    "id": Number
});

const exerciseSchema = new Schema ({
    "user" : {
        type: String,
        required: true
    },
    "description": {
        type: String,
        required: true
    },
    "duration": {
        type: Number,
        required: true
    },
    "date": {
        type: Date
    }
});

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
