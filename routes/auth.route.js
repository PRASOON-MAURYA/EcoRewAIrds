const router = require('express').Router();
const Admin = require('../models/admin.model');
const User = require('../models/user.model');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

const { registerValidator } = require('../utils/validators');
const { ensureAuthenticated, ensureNOTAuthenticated } = require('../utils/permissions');
// const { registerNotify } = require('../utils/send.notification');

const multer = require('multer');

// Set up Multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    // fileSize: 200 * 1024, // 200 KB in bytes

    fileSize: 2 * 1024 * 1024, // 2 MB in bytes
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (jpeg, png, gif) are allowed.'));
    }
  },
});



const transporter = require('../utils/nodemailer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

router.get('/logout', ensureAuthenticated, function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    // This callback function is called after logout is complete
    req.flash('info', 'You have been logged out');
    console.log("logout");
    res.redirect('/');
  });
});


router.post('/send-otp', async (req, res, next) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const { email, role, purpose } = req.body;
    await transporter.sendMail({
      from: 'Prasoon2013127@akgec.ac.in',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP for registration is: ${otp}`,
    });

    // console.log(req.body);

    req.flash('info', `OTP sended to ${email}`);
    res.render('emailVerify', { systemOTP: otp, email, role, purpose, messages: req.flash() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error sending OTP.' });
  }
});

router.post('/verify-otp', async (req, res, next) => {
  const { enteredOTP, systemOTP, email, role, purpose } = req.body;
  // console.log(req.body);

  if (enteredOTP !== systemOTP) {
    req.flash('error', 'OTP Verification Failed !!!');
    req.flash('warning', 'Enter the correct OTP');
    res.render('emailVerify', { systemOTP, email, role, purpose, messages: req.flash() });
    return;
  }
  req.flash('success', 'OTP Verified Successfully !!!');
  if (purpose === 'register') {
    res.render('register-' + role, { email, messages: req.flash() });
    return;
  }
  else if (purpose === 'reset') {

    const userType = role.charAt(0).toUpperCase() + role.slice(1);

    const userModel = mongoose.model(userType);

    const user = await userModel.findOne({ email });
    if (!user) {

      req.flash('warning', `${email} is not registered !!!`);
      res.redirect('/auth/login/' + role);
      return;
    }
    res.render('reset-password', { email, role, passKey: process.env.RESET_PASS_KEY });
    return;
  }
  // res.render('register-admin');
});

router.get('/reset/:userType', async (req, res, next) => {
  // console.log(req.body);
  const { userType } = req.params;
  res.render('emailOTP', { role: userType, purpose: 'reset' });

});

router.post('/reset/:userType', async (req, res, next) => {
  console.log(req.body);
  const { email, password, password2, role, passKey } = req.body;

  // CODE TO APPLY SECURITY FROM RESETTING PASSWORD FROM OUTSIDE POST REQUESTS
  if (passKey !== process.env.RESET_PASS_KEY) {
    // req.flash('warning', `Do not try to login other user !!!`);
    res.send(`Do not try to login other user !!!`);
    return;
    res.redirect('/auth/login/' + role);
    return;
  }

  if (password.length < 2) {
    req.flash('warning', 'Password length must be 2 char long !!!'); //HANDLE IT
    res.render('reset-password', { email, role, messages: req.flash() });
    return;
  }
  if (password !== password2) {
    req.flash('warning', 'Password do not match !!!');
    res.render('reset-password', { email, role, messages: req.flash() });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userType = role.charAt(0).toUpperCase() + role.slice(1);
  const userModel = mongoose.model(userType);

  const user = await userModel.findOne({ email });
  user.password = hashedPassword;
  user.save();

  req.flash('success', 'Password Updated !!!');

  res.redirect('/auth/login/' + role);
  return;
});


router.use('/', ensureNOTAuthenticated);

router.get('/login/', async (req, res, next) => {
  res.render('login-links');
}
);
router.get('/register/', async (req, res, next) => {
  res.render('register-links');
}
);

router.get('/login/:userType', async (req, res, next) => {
  const { userType } = req.params;
  res.render('login', { userType });
}
);

router.post("/login/:userType", (req, res, next) => {
  // After successful login, redirect to the stored URL or default to '/'
  const redirectTo = req.session.returnTo || '/';
  delete req.session.returnTo; // Remove the stored redirect URL
  const { userType } = req.params;

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', info.message);
      // return res.redirect("back");


      req.session.returnTo = redirectTo;
      // req.flash('info', 'You need to login first to view this page'); UNCOMMENT WHEN YOU NEED TO FLASH MESSAGE THROUGH THE REDIRECTED PROCESS
      // console.log(req.originalUrl);
      // console.log(redirectTo);
      return res.redirect('/auth/login/' + userType);
    }
    req.logIn(user, err => {
      if (err) {
        return next(err);
      }

      req.session.role = user.role;
      req.session.rank = 1;
      if (user.role == 'user') req.session.rank = 2;
      if (user.role == 'admin') req.session.rank = 3;
      console.log(req.session.rank);

      req.flash('success', 'You have successfully logged in');
      // console.log(user.role);
      // console.log(user._id);
      // console.log(user.id);
      // console.log(user.roleValue);

      // user.roleValue = 29;
      // console.log(user.roleValue);
      return res.redirect(redirectTo);
    });
  })(req, res, next);
});


router.get('/register/:userType', async (req, res, next) => {
  const { userType } = req.params;

  res.render('emailOTP', { role: userType, purpose: 'register' });
}
);

router.post('/register-user', registerValidator, async (req, res, next) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => {
        req.flash('error', error.msg);
      });
      res.render('register-user', {
        name: req.body.name,
        email: req.body.email,
        city: req.body.city,
        // details: req.body,
        messages: req.flash(),
      });
      return;
    }


    const { email } = req.body;
    const doesExist = await User.findOne({ email });
    if (doesExist) {
      req.flash('warning', `User/${email} already registered`);
      res.redirect('/auth/register/user');
      return;
    }
    const user = new User(req.body);
    await user.save();
    req.flash(
      'success',
      `${user.email} registered succesfully, you can now login`
    );
    const role = user.role.toLowerCase();
    res.redirect('/auth/login/' + role);
  } catch (error) {
    next(error);
  }
}
);

router.post('/register-admin', registerValidator, async (req, res, next) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => {
        req.flash('error', error.msg);
      });
      res.render('register-admin', {
        name: req.body.name,
        email: req.body.email,
        // details: req.body,
        messages: req.flash(),
      });
      return;
    }



    const { email } = req.body;
    const doesExist = await Admin.findOne({ email });
    if (doesExist) {
      req.flash('warning', `Admin/${email} already registered`);
      res.redirect('/auth/register/admin');
      return;
    }
    const user = new Admin(req.body);
    await user.save();
    req.flash(
      'success',
      `${user.email} registered succesfully, you can now login`
    );
    const role = user.role.toLowerCase();
    res.redirect('/auth/login/' + role);
    // res.redirect('/auth/login');
  } catch (error) {
    next(error);
  }
}
);

// router.post('/register-teacher', upload.single('pic'), registerValidator, async (req, res, next) => {
//   try {

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       errors.array().forEach((error) => {
//         req.flash('error', error.msg);
//       });
//       res.render('register-teacher', {
//         formDetails: req.body,
//         // pic: req.body.pic,
//         // details: req.body,
//         messages: req.flash(),
//       });
//       return;
//     }


//     const { email } = req.body;
//     const doesExist = await Teacher.findOne({ email });
//     if (doesExist) {
//       req.flash('warning', `Teacher/${email} already registered`);
//       res.redirect('/auth/register/teacher');
//       return;
//     }

//     // NOT WORK BECOZ req.body.pic is undefined
//     // req.body.pic.imageName = req.file.originalname,
//     // req.body.pic.imageData = req.file.buffer

//     // Method 1 
//     // req.body.pic = {
//     //   imageName: req.file.originalname,
//     //   imageData: req.file.buffer
//     // }

//     // Method 2
//     req.body.pic = req.file;

//     const user = new Teacher(req.body);
//     await user.save();

//     registerNotify(req)
//     // .then(resultsame => {
//     //   console.log('Notification added:', resultsame);
//     // })
//     // .catch(error => {
//     //   console.error('Error:', error);
//     // });

//     req.flash(
//       'success',
//       `${user.email} registered succesfully, you can now login`
//     );
//     const role = user.role.toLowerCase();
//     res.redirect('/auth/login/' + role);
//   } catch (errorS) {
//     // console.log(error.message);
//     // console.log(error);
//     let count = 1;
//     errorS.forEach((error) => {
//       req.flash('warning', "Warning " + count + "--    On " + error[1] + ", Period " + error[2] + " in " + error[3] + " is taken by " + error[0] + "\nPlease Update The Section !!!");
//       count++;
//     });

//     for (let x = 0; x < 5; x++) {
//       for (let i = 0; i < 7; i++) {

//         errorS.forEach((error) => {

//           if (req.body.periods[x].day === error[1] && req.body.periods[x].periodList[i].val == error[2] && req.body.periods[x].periodList[i].class === error[3]) {

//             req.body.periods[x].periodList[i].duplicate = "duplicate";

//           }

//         });

//       }
//     }


//     req.flash('info', 0); // It will not work becozz 2nd argument of flash() cannot work with 0 
//     res.render('register-teacher', {
//       messages: req.flash(),
//       formDetails: req.body

//     });
//     // console.log(req.body.periods[0]);
//     // console.log(req.body.periods[1]);
//     // console.log(req.body.periods[0].periodList[0]);
//     return; //OPTIONAL BUT NEED TO STOP AFTER RUNNING console.log(req.body.periods);
//     console.log("Stopped");
//     // next(error);
//   }
// }
// );




module.exports = router;



// function sendEJS(req, res, next) {
//   console.log(req);
//   res.render('emailOTP');
// }

// function sendEJS(role) {
//   return async function (req, res, next) {
//     // console.log(role);
//     res.render('emailOTP', { role, purpose: 'register' });
//   };
// }