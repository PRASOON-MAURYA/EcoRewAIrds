// config/nodemailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: 'Prasoon2013127@akgec.ac.in',
    pass: 'gujylufulmfrmrkv',
  },
  tls: {
    rejectUnauthorized: false
  }
});



module.exports = transporter;
