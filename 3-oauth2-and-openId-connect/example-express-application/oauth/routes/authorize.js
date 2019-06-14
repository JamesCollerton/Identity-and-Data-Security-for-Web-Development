var express = require('express');
var router = express.Router();

const OAuthError = require('../lib/error/errors/oautherror')
const logger = require('../lib/util/logger')

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

	logger.info('Set all variables')

	if (!responseType) {
		logger.info("Cancel the request - missing response type")
		throw new OAuthError('invalid_request', 'Missing parameter: response_type');
	}
	if (responseType !== 'code') {
		logger.info("Unsupported response type")
		throw new OAuthError('invalid_request', 'Missing parameter: code');
	}
	if (!clientId) {
		logger.info("Cancel the request - client Id is missing")
		throw new OAuthError('invalid_request', 'Missing parameter: client_id');
	}

	if(scope && scope.indexOf('openid') > 0) {
		logger.info("Using OpenId to authenticate the user, this is not implemented")
	}

	// Check if the client exists, if it does not then we should create
	// one in the DB

	logger.info('Checking to see if client already exists')

	Client.findOne({
		clientId: clientId
	}, function (err, client) {

		if (err) {
			logger.info('Error finding client')
			// handle the error by passing it to the middleware
			next(new OAuthError('server_error', 'Server errored finding client'));
		}
		if (!client) {
			logger.info('No existing client, saving new client')

			var newClient = new Client({
				clientId: clientId,
				clientSecret: uuid.v4(),
				name: uuid.v4(),
				scope: scope,
				userId: uuid.v4(),
				redirectUri: redirectUri
			})

			logger.info(newClient)

			newClient.save()

			client = newClient
		}
		if (redirectUri !== client.redirectUri) {
			logger.info('Redirect URI does not match client redirect URI')
			next(new OAuthError('invalid_request', 'Mismatched client parameter: redirect_uri'));
			// cancel the request
		}
		if (scope !== client.scope) {
			logger.info('Scope does not match client scope')
			next(new OAuthError('invalid_request', 'Mismatched client parameter: scope'));
			// handle the scope
		}

		logger.info('Creating new authorisation code')

		var authCode = new AuthCode({
			clientId: clientId,
			userId: client.userId,
			redirectUri: redirectUri
		});

		authCode.save();

		logger.info(authCode)

		logger.info('Creating new response')

		var response = {
			state: state,
			code: authCode.code
		};

		logger.info(response)

		if (redirectUri) {

			logger.info('Redirecting using redirect URI')

			var redirect = redirectUri +
			'?code=' + response.code +
			(state === undefined ? '' : '&state=' + state);
			res.redirect(redirect);
		} else {

			logger.info('Sending response')

			res.json(response);
		}
	});
});

module.exports = router;

