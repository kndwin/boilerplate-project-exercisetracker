const User = require('./userModel.js')
const shortid = require('shortid');

module.exports = function(app) {
  var done = (error, data) => {
    console.log( error ? "Error: " + error : "Success: " + data  );
  };
  
  // 1. I can create a user by posting form data username to 
  // /api/exercise/new-user and returned will be an object
  // with username and _id
  
  app.post("/api/exercise/new-user", function( req,res ) {
    User.findOne({ username: req.body.username })
      .then( user => {
        if (user !== null) {
          res.json("The user already exist");
          return Promise.reject("The user already exist")
        } else {
          const newUser = {
            username: req.body.username,
            userId: shortid.generate()
          }
          res.json({
            username: req.body.username,
            _id: newUser.userId
          });
          return User.create(newUser);
        }})
      .catch(err => done(err));
  });

  // 2. I can get an array of all users by getting
  // api/exercise/users with the same info as when
  // creating a user.
  
  app.get("/api/exercise/users", function (req,res) {
    User.find({}, '-_id -__v -log').then( users => {
      res.json(users);
    });
  });

  // 3. I can add an exercise to any user by posting form 
  // data userId(_id), description, duration, and optionally
  // date to /api/exercise/add. If no data supplied it will
  // user current data. Returned will be the user object with
  // also with the exercise fields added.

  app.post("/api/exercise/add", function( req, res ) {
    User.findOne({ userId: req.body.userId })
      .then(user => {
        if (user === null) {
          res.json("The user does not exist");
          return;
        } else {
          var { userId, description, 
              duration, date } = req.body
          if (date == "" || date == undefined) {
            date = new Date();
          } else {
            date = new Date(date);
          }

          if (userId === "") {
            res.json( "Please enter a user ID" );
          } else if (description === "") {
            res.json( "Please enter a description" );
          } else if (duration === "") {
            res.json( "Please enter a duration" );
          } else if (isNaN(parseInt(duration)) === true) {
            res.json( "Please enter a duration with numbers" );
          } else if (date == "Invalid Date" ) {
            res.json("Please enter a valid date")
          } else {
            console.log("--------------------------------------")
            console.log("api/exercise/add")
            console.log(req.body);
            console.log("--------------------------------------")
            res.json({
              _id: userId,
              username: user.username,
              description,
              duration: +duration,
              date: date.toDateString(),
            });
            console.log({
              username: username,
              description: description,
              duration: +duration,
              _id: userId,
              date: date.toDateString(),
            })
            user.log.push({
              description: description,
              duration: duration,
              date: date
            });
          }
          return user.save(done);
        }
      }).catch(err => done(err));
  });
  
  // 4. I can retrieve a full exercise log of any user by 
  // getting /api/exercise/log with a paramter of userId(_id)
  // Return will be the user object with added array log and
  // count (total exercise count)

  // 5. I can retrieve part of the log of any user by also passing
  // along optional paramters of from & to or limit
  // (Date format yyyy-mm-dd, limit = int)

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
            console.log("--------------------------------------")
            console.log("api/exercise/log")
            console.log(req.body);
            console.log("--------------------------------------")
            // Filter out result based on existing properties
            if (optional.from !== undefined) {
              user.log = user.log.filter( log => 
                log.date >= new Date(optional.from)
              );
            } 
            if (optional.to !== undefined){
              user.log = user.log.filter( log => 
                log.date <= new Date(optional.to)
              );
            }
            if (optional.limit !== undefined) {
              user.log = user.log.slice(0, optional.limit);
            }
            res.json( user );
          } else {
            res.json("User doesn't exist");
          }
        }) .catch(err => done(err));
    } else {
      // Return all users
      User.find({}, '-_id -__v -logs._id').exec()
        .then( log => { res.json( log );
      }).catch(err => done(err));
    }
  });
}
