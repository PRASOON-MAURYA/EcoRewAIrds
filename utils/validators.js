const { body } = require('express-validator');
module.exports = {
  registerValidator: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email must be a valid email')
      .normalizeEmail()
      .toLowerCase()
      .custom((value, { req }) => {
        if (value === "cannot@gmail.com") {
          throw new Error('Email - cannot@gmail.com cannot be registered');
        }
        return true;
      }),
    body('password')
      .trim()
      .isLength(2)
      .withMessage('Password length short, min 2 char required'),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password do not match');
      }
      return true;
    }),
    // body('matchResult')
    //   .trim()
    //   .isLength(2)
    //   .withMessage('Password length short, min 2 char required'),
  ],
};

