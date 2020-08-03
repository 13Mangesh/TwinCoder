var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStategy = require('passport-facebook').Strategy;

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findOne({_id: id}, (err, user) => {
        done(err, user);
    });
});

passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    (username, password, done) => {
        User.findOne({email: username}, (err, user) => {
            if(err) return done(err);
            if(!user) {
                return done(null, false, {
                    message: 'Incorrect Username or Password'
                });
            }
            if(!user.validPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect Username or Password'
                });
            }
            return done(null, user);
        });
    }
));

passport.use(new FacebookStategy({
    clientID: '',
    clientSecret: '',
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email']
}, (token, refreshToken, profile, done) => {
    User.findOne({'facebookId': profile.id}, (err, user) => {
        if (err) return done(err);

        if(user) {
            return done(null, user);
        } else {
            User.findOne({email: profile.emails[0].value}, (err, user) => {
                if(user) {
                    user.facebookId = profile.id
                    return user.save((err) => {
                        if(err) return done(null, false, { message: "Can't save user info" });
                        return done(null, user);
                    })
                }

                var user = new User();
                user.name = profile.displayName;
                user.email = profile.emails[0].value;
                user.facebookId = profile.id
                user.save((err) => {
                    if(err) return done(null, false, { message: "Can't save user info" });
                    return done(null, user);
                });
            })
        }
    });
}));
