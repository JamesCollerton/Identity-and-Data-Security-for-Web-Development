
const secureConfig = require('../config/secure-config/config')
const authy = require('authy')(secureConfig.api_key);

var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {

    console.log("In register")

    var email = req.body.email;
    var phone = req.body.phone;
    var countryCode = req.body.countryCode;

    console.log("Email: " + email)
    console.log("Phone: " + phone)
    console.log("Country Code: " + countryCode)

    authy.register_user(email, phone, countryCode,
        function(err, response) {
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
        }
    );

});

module.exports = router;