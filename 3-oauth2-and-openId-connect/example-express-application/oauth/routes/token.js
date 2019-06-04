var express = require('express');
var router = express.Router();

// const winston = require('winston')
const logger = require('../lib/util/logger')

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

	logger.log('info', 'Authorize', {
		grantType,
		refreshToken,
		authCode,
		redirectUri,
		clientId
	})

	if (!grantType) {
		logger.log('error', 'No grant type supplied')
		// no grant type passed - cancel this request
	}

	if (grantType === 'authorization_code') {

		logger.log('info', 'Grant type authorization code')

		AuthCode.findOne({
			code: authCode
		}, function(err, code) {
			if (err) {
				logger.log('error', 'Error finding auth code')
				// handle the error
			}
			if (!code) {
				logger.log('error', 'No auth code')
				// no valid authorization code provided - cancel
			}
			if (code.consumed) {
				logger.log('error', 'Auth code already consumed')
				// the code got consumed already - cancel
			}
			code.consumed = true;
			code.save();

			if (code.redirectUri !== redirectUri) {
				logger.log('error', 'Code redirect URI not equal to incoming redirect URI')
				// cancel the request
			}

			logger.log('info', 'Searching for client')

			// validate the client id - an extra security measure
			Client.findOne({
				clientId: clientId
			}, function(error, client) {

				if (error) {
					logger.log('error', 'Error discovering client')
					// the client id provided was a mismatch or does not exist
				}
				if (!client) {
					logger.log('error', 'The client id provided was a mismatch or does not exist')
					// the client id provided was a mismatch or does not exist
				}

				logger.log('info', 'Found client, now creating a new refresh token', client)

				// Issuing a refresh token to go along with the access token so we
				// can keep refreshing the login token as long as we need.
				var _refreshToken = new RefreshToken({
					userId: code.userId
				});
				_refreshToken.save();

				logger.log('info', 'Created new refresh token', _refreshToken)

				var _token = new Token({
					refreshToken: _refreshToken.token,
					userId: code.userId
				});
				_token.save();

				logger.log('info', 'Created new token', _token)

				// send the new token to the consumer
				var response = {
					access_token: _token.accessToken,
					refresh_token: _token.refreshToken,
					expires_in: _token.expiresIn,
					token_type: _token.tokenType
				};

				logger.log('info', 'Sending response', response)

				res.json(response);
			});
		});

	/*
		Create another refresh token and access token. I would probably do this
		every new request rather than using the access token.
	*/
	} else if (grantType === 'refresh_token') {
		if (!refreshToken) {
			logger.log('error', 'No refresh token provided')
			// no refresh token provided - cancel
		}

		logger.log('info', 'Searching for refresh token')

		RefreshToken.findOne({
			token: refreshToken
		}, function (err, token) {

			if (err) {
				logger.log('error', 'Error finding refresh token')
				// handle the error
			}
			if (!token) {
				logger.log('error', 'No refresh token found')
				// no refresh token found
			}
			if (token.consumed) {
				logger.log('error', 'Refresh token consumed')
				// the token got consumed already
			}

			logger.log('info', 'Found the token', token)

			// consume all previous refresh tokens
			RefreshToken.updateMany({
				userId: token.userId,
				consumed: false
			}, {
				$set: {consumed: true}
			});

			logger.log('info', 'Updated refresh tokens to be consumed')

			var _refreshToken = new RefreshToken({
				userId: token.userId
			});

			_refreshToken.save();

			logger.log('info', 'Created new refresh token', _refreshToken)

			var _token = new Token({
				refreshToken: _refreshToken.token,
				userId: token.userId
			});

			_token.save();

			logger.log('info', 'Created new token', _token)

			var response = {
				access_token: _token.accessToken,
				refresh_token: _token.refreshToken,
				expires_in: _token.expiresIn,
				token_type: _token.tokenType
			};

			logger.log('info', 'Sending response', response)

			// send the new token to the consumer
			res.json(response);
		});
	}
});

module.exports = router;
