
const secureConfig = require('../config/secure-config/config')
const authy = require('authy')(secureConfig.api_key);

var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {

    console.log("In register")

    var email = req.body.email;
    var number = req.body.number;

    console.log("Email: " + email)
    console.log("Number: " + number)

    authy.register_user(email, number, function (err, response){
        //expected response:
        //{ message: 'User created successfully.',
        // user: { id: 16782433 },
        // success: true }
        res.send(response);
    });

});

module.exports = router;