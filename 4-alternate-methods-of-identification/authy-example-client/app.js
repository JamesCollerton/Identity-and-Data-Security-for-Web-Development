/*
    This is the client application, we should be able to run this once the
    oauth application is running and be able to return a list of users.
*/

const request = require('request');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

const secureConfig = require('./secure-config/config');

/*
    Try issuing an OpenId token
*/
function register() {
    console.log("Registering user " + secureConfig.email + ", " + secureConfig.number + ", " + secureConfig.countryCode)
    request({
        url: 'http://localhost:3000/register',
        method: 'POST',
        json: {
            email: secureConfig.email,
            phone: secureConfig.phone,
            countryCode: secureConfig.countryCode,
        }
      }, function(error, response, body){
        console.log(body);
        sms(body.user.id)
    });
}

/*
    Then send an SMS
*/
function sms(userId) {
    console.log("Sending sms to user with Id " + userId)
    request({
        url: 'http://localhost:3000/sms',
        method: 'POST',
        json: {
            userId: userId
        }
      }, function(error, response, body){
        console.log(body);
        verify(userId)
    });
}

/*
    Then verify that phone
*/
function verify(userId) {
    console.log("Verifying user with Id " + userId)
    readline.question("Verification code: ", (verificationCode) => {
        request({
            url: 'http://localhost:3000/verify',
            method: 'POST',
            json: {
                userId: userId,
                verificationCode: verificationCode
            }
          }, function(error, response, body){
            console.log(body);
        });
        readline.close()
    })
}

register()