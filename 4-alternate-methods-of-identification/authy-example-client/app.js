/*
    This is the client application, we should be able to run this once the
    oauth application is running and be able to return a list of users.
*/

const request = require('request');
const secureConfig = require('./secure-config/config');

/*
    Try issuing an OpenId token
*/
function register() {
    console.log(secureConfig)
    console.log("Registering user " + secureConfig.email + ", " + secureConfig.number)
    request({
        url: 'http://localhost:3000/register',
        method: 'POST',
        json: {
            email: secureConfig.email,
            number: secureConfig.number
        }
      }, function(error, response, body){
        console.log(body);
    });
}

register()