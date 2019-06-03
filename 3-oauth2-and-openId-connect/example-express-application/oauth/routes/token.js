var express = require('express');
var router = express.Router();

var AuthCode = require('../lib/models/authcode');
var Client = require('../lib/models/client');
var Token = require('../lib/models/token');
var RefreshToken = require('../lib/models/refreshtoken');

/*
	This is the end point that is used to issue the tokens themselves. We take
	the code as authorized if it exists in our database.
*/
router.post('/', function (req, res, next) {
	
	var grantType = req.body.grant_type;
	var refreshToken = req.body.refresh_token;
	var authCode = req.body.code;
	var redirectUri = req.body.redirect_uri;
	var clientId = req.body.client_id;

	if (!grantType) {
		// no grant type passed - cancel this request
	}

	if (grantType === 'authorization_code') {
		AuthCode.findOne({
				code: authCode
		}, function(err, code) {
			if (err) {
				// handle the error
			}
			if (!code) {
				// no valid authorization code provided - cancel
			}
			if (code.consumed) {
				// the code got consumed already - cancel
			}
			code.consumed = true;
			code.save();
		
			if (code.redirectUri !== redirectUri) {
				// cancel the request
			}
			
			// validate the client id - an extra security measure
			Client.findOne({
				clientId: clientId
			}, function(error, client) {
				if (error) {
					// the client id provided was a mismatch or does not exist
				}
				if (!client) {
					// the client id provided was a mismatch or does not exist
				}

				// Issuing a refresh token to go along with the access token so we
				// can keep refreshing the login token as long as we need.
				var _refreshToken = new RefreshToken({
					userId: code.userId
				});
				_refreshToken.save();
				var _token = new Token({
					refreshToken: _refreshToken.token,
					userId: code.userId
				});
				_token.save();
				// send the new token to the consumer
				var response = {
					access_token: _token.accessToken,
					refresh_token: _token.refreshToken,
					expires_in: _token.expiresIn,
					token_type: _token.tokenType
				};
				res.json(response);
			});
		});

	/*
		Create another refresh token and access token. I would probably do this
		every new request rather than using the access token.
	*/
	} else if (grantType === 'refresh_token') {
		if (!refreshToken) {
			// no refresh token provided - cancel
		}

		RefreshToken.findOne({
			token: refreshToken
		}, function (err, token) {

			if (err) {
				console.log("Error")
				// handle the error
			}
			if (!token) {
				console.log("No token")
				// no refresh token found
			}
			if (token.consumed) {
				console.log("Consumed")
				// the token got consumed already
			}
			
			console.log(token.userId)

			// consume all previous refresh tokens
			RefreshToken.updateMany({
				userId: token.userId,
				consumed: false
			}, {
				$set: {consumed: true}
			});
			
			var _refreshToken = new RefreshToken({
				userId: token.userId
			});
			
			_refreshToken.save();

			var _token = new Token({
				refreshToken: _refreshToken.token,
				userId: token.userId
			});
			
			_token.save();
			var response = {
				access_token: _token.accessToken,
				refresh_token: _token.refreshToken,
				expires_in: _token.expiresIn,
				token_type: _token.tokenType
			};

			// send the new token to the consumer
			res.json(response);
		});
	}
});

module.exports = router;
