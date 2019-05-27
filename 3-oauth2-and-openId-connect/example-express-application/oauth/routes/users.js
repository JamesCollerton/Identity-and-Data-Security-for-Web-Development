var express = require('express');
var router = express.Router();
var authorize = require('../lib/middleware/authorize');

/* GET users listing. */
router.get('/', authorize, function(req, res, next) {
  var user = {
    name: 'Tim Messerschmidt',
    country: 'Germany'
  }
  res.json(user);
});

module.exports = router;
