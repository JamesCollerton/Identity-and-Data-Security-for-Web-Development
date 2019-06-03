var express = require('express');
var router = express.Router();

const uuid = require('node-uuid');
const Client = require('../lib/models/client');
const AuthCode = require('../lib/models/authcode');

/*
	This is the end point that is used to authorize a user, give them an
	authorization code. The authorization part of the server says 'this is
	who this person says they are'. The access part of the server says 'this
	person is allowed to access these resources'.

	We use the clientId to identify a client to see if they are authorized,
	if they can log in they are given an authorization code. We then use the
	combination of the clientId and authorization code to give them access.

	In this case we authorize them as long as we find the clientId in the
	database.
*/
router.get('/', function(req, res, next) {

	var responseType = req.query.response_type;
	var clientId = req.query.client_id;
	var redirectUri = req.query.redirect_uri;
	var scope = req.query.scope;
	var state = req.query.state;

	// Save new client. We want any request to be valid and generate the
	// auth code.

	// var client = new Client({
	// 		clientId: clientId,
	// 		clientSecret: uuid.v4(),
	// 		name: uuid.v4(),
	// 		scope: scope,
	// 		userId: uuid.v4(),
	// 		redirectUri: redirectUri
	// })

	// client.save()

	if (!responseType) {
		// cancel the request - we miss the response type
		console.log("Cancel the request - missing response type")
	}
	if (responseType !== 'code') {
		// notify the user about an unsupported response type
		console.log("Unsupported response type")
	}
	if (!clientId) {
		// cancel the request - client id is missing
		console.log("Cancel the request - client Id is missing")
	}

	Client.findOne({
		clientId: clientId
	}, function (err, client) {

		if (err) {
			// handle the error by passing it to the middleware
			next(err);
		}
		if (!client) {
			// cancel the request - the client does not exist
		}
		if (redirectUri !== client.redirectUri) {
			// cancel the request
		}
		if (scope !== client.scope) {
			// handle the scope
		}

		var authCode = new AuthCode({
			clientId: clientId,
			userId: client.userId,
			redirectUri: redirectUri
		});

		authCode.save();

		var response = {
			state: state,
			code: authCode.code
		};

		if (redirectUri) {
			var redirect = redirectUri +
			'?code=' + response.code +
			(state === undefined ? '' : '&state=' + state);
			res.redirect(redirect);
		} else {
			res.json(response);
		}
	});
});

module.exports = router;

