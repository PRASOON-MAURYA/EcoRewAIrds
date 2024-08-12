const mongoose = require('mongoose');

function validateObjectId(req, res, next, variable, redirectUrl) {
  if (!mongoose.Types.ObjectId.isValid(variable)) {
    req.flash('error', 'Invalid id');
    res.redirect(redirectUrl);
    return; // Add return statement here
  }
  // next();
}




// async function validateObjectId(req, res, next, variable, redirectUrl) {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(variable)) {
//       req.flash('error', 'Invalid id');
//       return res.redirect(redirectUrl);
//     }
//     // next();
//   } catch (error) {
//     next(error);
//   }
// }

module.exports = validateObjectId;