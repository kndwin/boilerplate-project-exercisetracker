const User = require('./userModel.js')
const shortid = require('shortid');

module.exports = function(app) {
  var done = (err, data) => {
    if (err) {
      console.log("Error" + err);
    } else {
      console.log("Completed: " + data);
    }
  };

  app.get( "/api/hello", (req, res, next) => {
    res.json({
      message: "Hello world!"
    })
  })

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
      res.json(users);
    });
  });

  // POST response
  app.post("/api/exercise/new-user", function( req,res ) {
    User.findOne({ username: req.body.username }).then( user => {
      if (user !== null) {
        return Promise.reject(new Error("The user already exist"));
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
      }
    }).catch(err => done(err));
  });

  app.post("/api/exercise/add", function( req, res ) {
    console.log("========================")
    console.log("req=====================")
    console.log("========================")
    console.log(req.body)
    User.findOne({ userId: req.body.userId }).then(user => {
      if (user === null) {
        res.json("The user does not exist");
        return Promise.reject(new Error("The user does not exist"));
      } else {
        var { userId, username, description, duration } = req.body
        var date = req.body.date;
        if (date == "") {
          console.log("Date is null")
          date = new Date();
        }

        console.log(`Date after conversion: ${date}`)

        if (userId === "") {
          res.json( "Please enter a user ID" );
        } else if (description === "") {
          res.json( "Please enter a description" );
        } else if (duration === "") {
          res.json( "Please enter a duration" );
        } else if (isNaN(parseInt(duration)) === true) {
          res.json( "Please enter a duration with numbers" );
        } else if (date == "Invalid Date" || date == undefined) {
          res.json("Please enter a valid date")
        } else {
          const log = {
            description: description,
            duration: duration,
            date: date
          };

          res.json({
            username: username,
            description: description,
            duration: duration,
            _id: userId,
            date: date
          });
         
          user.logs.push(log);
          return user.save(done);
        }
      }
    }).catch(err => done(err));
  });
}
