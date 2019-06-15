/*
    This is the client application, we should be able to run this once the
    oauth application is running and be able to return a list of users.
*/

const request = require('request');

/*
    Check client authorization
*/
function checkClientAuthorization(next) {
    console.log("Checking the client authorization")
    request(
        'http://localhost:3000/authorize?response_type=code&client_id=1&scope=openid&state=s',
        { json: true },
        (err, res, body) => {
            if (err) { return console.log(err); }
            console.log(body);
            next(body.code)
    });
}

/*
    Retrieve token
*/
function retrieveAccessToken(authorizationCode) {
    console.log("Retrieving an access token for authorization code " + authorizationCode)
    request({
        url: 'http://localhost:3000/token',
        method: 'POST',
        json: {
            grant_type: "authorization_code",
            code: authorizationCode,
            client_id: "1"
        }
      }, function(error, response, body){
        console.log(body);
        refreshToken(body.access_token, body.refresh_token)
    });
}

/*
    Refresh token
*/
function refreshToken(accessToken, refreshToken) {
    console.log("Refreshing the token for access token " + accessToken + " and refresh token " + refreshToken)
    request({
        url: 'http://localhost:3000/token',
        method: 'POST',
        json: {
            grant_type: "refresh_token",
            code: accessToken,
            refresh_token: refreshToken,
            client_id: "1"
        }
      }, function(error, response, body){
        console.log(body);
        getUsers(body.access_token)
    });
}

/*
    Get users
*/
function getUsers(accessToken) {
    console.log("Getting users with access token " + accessToken)
    request({
        url: 'http://localhost:3000/users',
        method: 'GET',
        headers: {'authorization': 'code ' + accessToken}
      }, function(error, response, body){
        console.log(body);
        checkClientAuthorization(issueOpenIdToken)
    });
}

/*
    Try issuing an OpenId token
*/
function issueOpenIdToken(authorizationCode) {
    console.log("Retrieving an OpenId access token for authorization code " + authorizationCode)
    request({
        url: 'http://localhost:3000/token',
        method: 'POST',
        json: {
            grant_type: "authorization_code",
            code: authorizationCode,
            client_id: "1"
        }
      }, function(error, response, body){
        console.log(body);
    });
}

checkClientAuthorization(retrieveAccessToken)