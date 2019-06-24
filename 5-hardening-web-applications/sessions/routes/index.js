var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  console.log("Session Id: " + req.sessionID)
  console.log(req.session)

  res.render('index', { title: 'Express' });
});

module.exports = router;
