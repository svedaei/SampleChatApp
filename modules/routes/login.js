var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Login' });
});

router.post('/check', function (req, res, next) {
  const User = require('../models/User.model');
  User.findOne({username: req.body.username, password: req.body.passwd}, function(err, user) {
    if(err){
      console.log('Cannot find user!')
    }else{
      req.session.user = user;
    }
    res.writeHead(302, {'location': '/'});
    res.end();
  });
});
module.exports = router;
