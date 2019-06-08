/*
    This is the client application, we should be able to run this once the
    oauth application is running and be able to return a list of users.
*/

const request = require('request');

/*
    Check client authorization
*/
request('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body.url);
  console.log(body.explanation);
});

/*
    Retrieve token
*/

/*
    Refresh token
*/

/*
    Get users
*/