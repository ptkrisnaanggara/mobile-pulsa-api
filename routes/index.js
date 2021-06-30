var express = require('express');
var router = express.Router();
var auth = require('./auth');
var passport = require('passport');

const userController = require('../controllers').user;
const transactionController = require('../controllers').transaction;
const productController = require('../controllers').product;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/product/:req', auth.required, productController.listProduct);
router.post('/api/check/:req', auth.required, productController.checkProduct);
router.post('/api/transaction/:req', auth.required, transactionController.commitTransaction);
router.post('/api/register', userController.register);

router.post('/api/login', function(req, res, next){
  if(!req.body.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  // console.log(req.body)

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

module.exports = router;
