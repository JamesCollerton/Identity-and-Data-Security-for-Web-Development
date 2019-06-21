const secureConfig = require('../config/secure-config/config')
const authy = require('authy')(secureConfig.api_key);

var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {

    console.log("In verify")

    var userId = req.body.userId;
    var verificationCode = req.body.verificationCode;

    console.log("User Id: " + userId)
    console.log("Verification Code: " + verificationCode)

    authy.verify(userId, verificationCode, function(err, response) {
        if(err){
            if(response && response.json) {
                console.log(response)
                res.send(response)
            } else {
                console.log(err)
                res.send(err);
            }
            return;
        }
        console.log(response)
        res.send(response)
    });

});

module.exports = router;