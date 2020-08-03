var express = require('express');
var router = express.Router();
var passport = require('passport');
const { check, validationResult } = require('express-validator');
require('https').globalAgent.options.rejectUnauthorized = false;


router.route('/login')
    .get((req, res, next) => {
        res.render('login', { title: 'Login to your account' });
    })
    .post(passport.authenticate('local', {
        failureRedirect: '/login'
    }), (req, res) => {
        res.redirect('/');
    });
  
  router.route('/register')
    .get((req, res, next) => {
        res.render('register', { title: 'Register a new account' });
    })
    .post([
        check('name').notEmpty().withMessage('Name Should not be empty'),
        check('email').isEmail().withMessage('Invalid email'),
        check('password').notEmpty().withMessage('Password Should not be empty'),
        check('password').notEmpty().custom((value, {req, loc, path}) => {
            if (value !== req.body.confirmPassword) {
                return false;
            } else {
                return value;
            }
        }).withMessage('Password do not match')
    ], (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.render('register', {
                name: req.body.name,
                email: req.body.email,
                errorMessages: errors.array()
            });
        } else {
            var user = new User();
            user.name = req.body.name;
            user.email = req.body.email;
            user.setPassword(req.body.password);
            user.save(err => {
                if(err) {
                    res.render('register', {errorMessages: err});
                } else {
                    res.redirect('/login');
                }
            });
        }
    });

router.get('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/');
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/'
}, (err, user, info) => {
    console.log(err, user, info);
    
}));

module.exports = router;