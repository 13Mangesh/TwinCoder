var express = require('express');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var router = express.Router();
const { check, validationResult } = require('express-validator');

var nodemailer = require('nodemailer');
var config = require('../config');
var transporter = nodemailer.createTransport(config.mailer);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TwinCoder - Boost your Programming' });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'TwinCoder - Boost your Programming' });
});

router.route('/contact')
.get(function(req, res, next) {
  res.render('contact', { title: 'TwinCoder - Boost your Programming' });
}).
post([
  check('name').notEmpty().withMessage('Name should not be empty.'),
  check('email').isEmail().withMessage('Please enter valid email'),
  check('message').notEmpty().withMessage('Message should not be emoty')
], (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.render('contact', {
      title: 'TwinCoder - Boost your Programming',
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      errorMessages: errors.array()
    });
  } else {
    var mailOptions = {
      from: 'TwinCoder - Boost your programming',
      to: '13mangeshpuri@gmail.com',
      subject: 'You have got a new visitor..',
      text: req.body.message
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if(error) {
        return console.log(error);
      }
      res.render('thank', { title: 'TwinCoder - Boost your Programming' });
    });
  }
});


module.exports = router;
