var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    var user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname
    };
    res.render('profile', { user: user });
});

module.exports = router;
