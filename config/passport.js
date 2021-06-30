var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const User = require('../models').User;
const bcrypt = require('bcrypt');


 passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, done) {
    User.findOne({where : {email: email}}).then(async function(user){
    const salt = '$2b$10$PZZJqckNsO6hpYC5VO9S1u';
    const passwords = await bcrypt.hash(password, salt);
   
    if(!user){
      return done(null, false, {errors: {'email': 'is invalid'}});
    }
    console.log(user['password'])
    console.log(passwords)
    if(user['password'] !== passwords) {
        return done(null, false, {errors: {'password': 'is invalid'}});
    }

    return done(null, user);
  }).catch(done);
}));

