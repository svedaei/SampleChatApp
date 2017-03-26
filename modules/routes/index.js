var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.user == null) {
        res.writeHead(302, {'location': '/login'});
        res.end();
    } else{
        res.render('index', {title: 'Chat'});
    }
});

module.exports = router;
