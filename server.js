const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var done = (err, data) => {
  if (err) {
    console.log("Error" + err);
  } else {
    console.log("Completed: " + data);
  }
};

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect(process.env.MLAB_URI, options); 

const Schema = mongoose.Schema;

const userSchema = new Schema ({
  username: {
    type: String,
    required: true
  },
  userId: String,
  logs: [{
    description: String, 
    duration: Number, 
    date: Date 
  }]
});

const User = mongoose.model('User', userSchema);

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
app.get("/api/exercise/log", function( req,res ) {
  if (req.query.userId !== undefined) {
    User.find({ userId: req.query.userId}, 
      '-_id -logs._id -__v').exec().then( user => {
        // Array to Object
        user = user[0]; 
        // User exists
        if (user !== undefined) { 
          const optional = {
            from: req.query.from,
            to: req.query.to,
            limit: req.query.limit
          };

          // Filter out result based on existing properties
          if (optional.from !== undefined) {
            user.logs = user.logs.filter( log => 
              log.date >= new Date(optional.from)
            );
          } 
          if (optional.to !== undefined){
            user.logs = user.logs.filter( log => 
              log.date <= new Date(optional.to)
            );
          }
          if (optional.limit !== undefined) {
            user.logs = user.logs.slice(0, optional.limit);
          }
          res.json( user );
        } else {
          res.json("User doesn't exist");
        }
      }) .catch(err => done(err));
  } else {
    // Return all users
    User.find({}, '-_id -__v -logs._id').exec()
      .then( logs => { res.json( logs );
    }).catch(err => done(err));
  }
});

app.get("/api/exercise/users", function (req,res) {
  User.find({}, '-_id -__v -logs').then( users => {
    res.json(users)
  })
})

// POST response
app.post("/api/exercise/new-user", function(req,res) {
  const newUser = {
    username: req.body.username,
    userId: shortid.generate()
  };
  User.findOne({ username: newUser.username }, (err,user) => {
    if (user === null) {
      User.create(newUser, (err,data) => {
        res.json({
          username: newUser.username,
          _id: newUser.userId
        });
        return err ? done(err) : done(null,data);
      });
    } else {
      res.json("User already exist");
    }
    return err ? done(err) : done(null,done);
  });
  //User.findOne({ username: req.body.username }).exec().then( user => {
    //if (user !== null) throw "User already exist"
    //return {
//
    //}
  //}).catch(err => done(err));
});

app.post("/api/exercise/add", function( req, res ) {
   const newExercise = {
    userId: req.body.userId,
    username: "",
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date === "" ? new Date().toDateString() :
        new Date(req.body.date).toDateString()
  };
   
  User.findOne({ userId: req.body.userId }).then(user => {
      if (user !== null) {
        newExercise.username = user.username;
      } else {
        newExercise.username = "User doesn't exist";
      }
      return newExercise;
    }).then( exercise => {
      if (exercise.userId === "") {
        res.json( "Please enter a user ID" );
      } else if (exercise.description === "") {
        res.json( "Please enter a description" );
      } else if (exercise.duration === "") {
        res.json( "Please enter a duration" );
      } else {
        if (isNaN(parseInt(exercise.duration)) === true) {
          res.json( "Please enter a duration with numbers" );
        } else {
          console.log("Hey!");
          const log = {
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date
          };
          User.findOne({ userId: exercise.userId })
            .exec().then(userFound => {
              userFound.logs.push(log);
              userFound.save(done);
          }).catch(err => done(err));
          res.json({
            username: exercise.username,
            description: exercise.description,
            duration: exercise.duration,
            _id: exercise.userId,
            date: new Date(exercise.date).toDateString()
          });
        }
      }
    }).catch(err => done(err));
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
