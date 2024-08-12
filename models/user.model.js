const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String
  },
  score: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  city: {
    type: String,
    required: true
  }
});

userSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      // if (this.email === process.env.ADMIN_EMAIL.toLowerCase()) {
      //   this.role = roles.admin;
      // }
      this.role = 'user';
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw createHttpError.InternalServerError(error.message);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
