const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const Admin = require('../models/admin.model');
// const User = require('../models/user.model');
// const Teacher = require('../models/teacher.model');
const mongoose = require('mongoose');
let userModel
passport.use(
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: 'email',
      passwordField: 'password',
    },
    async (req, email, password, done) => {
      try {
        // console.log(req.params);
        let { userType } = req.params;
        // console.log(userType);
        userType = userType.charAt(0).toUpperCase() + userType.slice(1);
        // console.log(userType);

        userModel = mongoose.model(userType);
        // console.log(userModel);
        const user = await userModel.findOne({ email });
        // Admin/email does NOT exist
        if (!user) {
          return done(null, false, {
            message: 'User/email not registered',
          });
        }
        // Email exist and now we need to verify the password
        const isMatch = await user.isValidPassword(password);
        if (isMatch) {
          req.flash('info', `${user} Logged In`);
        }
        return isMatch
          ? done(null, user)
          : done(null, false, { message: 'Incorrect password' });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  // done(null, user.id);
  done(null, user);
  // console.log(req.params);
});
// passport.use(function(req, res, next) {
//   passport.deserializeUser(function (id, done) {
//       console.log(req.params);
//     let collectionName = req.url.includes('admin') ? 'admin' : req.url.includes('student') ? 'student' : req.url.includes('teacher') ? 'teacher' : 'users';

//     Collection = require(`./models/${collectionName}.model`);

//     Collection.findById(id) //see it, see logout, see last passport aauthenticaion video
//       .then(user => {
//         done(null, user);
//       })
//       .catch(error => {
//         done(error, null);
//       });
//   });
//   next();
// });








// passport.deserializeUser(function (id, done) {
passport.deserializeUser(function (user, done) {

  userType = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  userModel = mongoose.model(userType);
  const id = user._id;
  userModel.findById(id) //see logout
    .then(user => {
      done(null, user);
    })
    .catch(error => {
      done(error, null);
    });
});

//  new passport
// passport.serializeUser(function(user, cb) {
//   process.nextTick(function() {
//     return cb(null, {
//       id: user.id,
//       username: user.username,
//       picture: user.picture
//     });
//   });
// });

// passport.deserializeUser(function(user, cb) {
//   process.nextTick(function() {
//     return cb(null, user);
//   });
// });
