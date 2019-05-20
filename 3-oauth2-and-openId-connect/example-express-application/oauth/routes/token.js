var AuthCode = require('../lib/models/authcode');
var Client = require('../lib/models/client');
var Token = require('../lib/models/token');
var RefreshToken = require('../lib/models/refreshtoken');

router.post('/', function (req, res) {
	
	var grantType = req.body.grant_type;
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
	}
});
