var express = require('express');
var router = express.Router();

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

	logger.info('Set all variables')

	if (!grantType) {
		logger.info('No grant type supplied')
		throw new OAuthError('invalid_request', 'Missing parameter: grant_type');
		// cancel this request
	}

	if (grantType === 'authorization_code') {

		logger.info('Grant type authorization code')

		AuthCode.findOne({
			code: authCode
		}, function(err, code) {
			if (err) {
				logger.info('Error finding auth code')
				next(new OAuthError('server_error', 'Server errored finding authorisation code'));
				// handle the error
			}
			if (!code) {
				logger.info('No auth code')
				next(new OAuthError('invalid_request', 'No such authorisation code'));
				// no valid authorization code provided - cancel
			}
			if (code.consumed) {
				logger.info('Auth code already consumed')
				next(new OAuthError('invalid_request', 'Authorisation code already consumed'));
				// the code got consumed already - cancel
			}

			logger.info('Changing the code to be consumed')

			code.consumed = true;
			code.save();

			logger.info('Code now saved')

			if (code.redirectUri !== redirectUri) {
				logger.info('Code redirect URI not equal to incoming redirect URI')
				next(new OAuthError('invalid_request', 'Mismatched authorisation code parameter: redirect_uri'));
				// cancel the request
			}

			logger.info('Searching for client')

			// validate the client id - an extra security measure
			Client.findOne({
				clientId: clientId
			}, function(error, client) {

				if (error) {
					logger.info('Error discovering client')
					next(new OAuthError('server_error', 'Server errored finding client'));
					// the client id provided was a mismatch or does not exist
				}
				if (!client) {
					logger.info('The client Id provided was a mismatch or does not exist')
					next(new OAuthError('invalid_request', 'No such client'));
					// the client id provided was a mismatch or does not exist
				}

				logger.info('Found client, now creating a new refresh token')
				logger.info(client)

				// Issuing a refresh token to go along with the access token so we
				// can keep refreshing the login token as long as we need.
				var _refreshToken = new RefreshToken({
					userId: code.userId
				});
				_refreshToken.save();

				logger.info('Created new refresh token')
				logger.info(_refreshToken)

				var _token = new Token({
					refreshToken: _refreshToken.token,
					userId: code.userId
				});
				_token.save();

				logger.info('Created new token')
				logger.info(_token)

				// send the new token to the consumer
				var response = {
					access_token: _token.accessToken,
					refresh_token: _token.refreshToken,
					expires_in: _token.expiresIn,
					token_type: _token.tokenType
				};

				logger.info('Sending response')
				logger.info(response)

				res.json(response);
			});
		});

	/*
		Create another refresh token and access token. I would probably do this
		every new request rather than using the access token.
	*/
	} else if (grantType === 'refresh_token') {
		if (!refreshToken) {
			logger.info('No refresh token provided')
			throw new OAuthError('invalid_request', 'Missing parameter: refresh_token');
			// no refresh token provided - cancel
		}

		logger.info('Searching for refresh token')

		RefreshToken.findOne({
			token: refreshToken
		}, function (err, token) {

			if (err) {
				logger.info('Error finding refresh token')
				next(new OAuthError('server_error', 'Server errored finding refresh token'));
				// handle the error
			}
			if (!token) {
				logger.info('No refresh token found')
				next(new OAuthError('invalid_request', 'No such refresh token'));
				// no refresh token found
			}
			if (token.consumed) {
				logger.info('Refresh token consumed')
				next(new OAuthError('invalid_request', 'Refresh token already consumed'));
				// the token got consumed already
			}

			logger.info('Found the token')
			logger.info(token)

			// consume all previous refresh tokens
			RefreshToken.updateMany({
				userId: token.userId,
				consumed: false
			}, {
				// $set: {consumed: true}
				consumed: true
			});

			logger.info('Updated refresh tokens to be consumed')

			var _refreshToken = new RefreshToken({
				userId: token.userId
			});

			_refreshToken.save();

			logger.info('Created new refresh token')
			logger.info(_refreshToken)

			var _token = new Token({
				refreshToken: _refreshToken.token,
				userId: token.userId
			});

			_token.save();

			logger.info('Created new token')
			logger.info(_token)

			var response = {
				access_token: _token.accessToken,
				refresh_token: _token.refreshToken,
				expires_in: _token.expiresIn,
				token_type: _token.tokenType
			};

			logger.info('Sending response')
			logger.info(response)

			// send the new token to the consumer
			res.json(response);
		});
	}
});

module.exports = router;
