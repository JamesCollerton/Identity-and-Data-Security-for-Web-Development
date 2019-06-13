var Token = require('../models/token');

const OAuthError = require('../error/errors/oautherror')

const logger = require('../util/logger')

/*
    Token middleware.

    The authorize end point is used to give out an authorization token, the token end point
    consumes the authorization token and gives out an access token, this middleware is used to
    make sure that each request has a valid access token associated with it.
*/
var authorize = function(req, res, next) {
    var accessToken;

    logger.info('In authorization middleware')

    // check the authorization header
    if (req.headers.authorization) {

        // validate the authorization header
        var parts = req.headers.authorization.split(' ');

        logger.info('Found headers')
        logger.info(parts)

        if (parts.length < 2) {
            // no access token got provided - cancel
            res.set('WWW-Authenticate', 'Bearer');
            res.sendStatus('401');
            return;
        }

        accessToken = parts[1];

    } else {
        // access token URI query parameter or entity body
        accessToken = req.query.access_token || req.body.access_token;
    }

    logger.info('Access token found ' + accessToken)

    if (!accessToken) {
        logger.info('No access token found')
        throw new OAuthError('unauthorized_client', 'No access token supplied');
        // no access token got provided - cancel with a 401
    }
    Token.findOne({
        accessToken: accessToken
    }, function(err, token) {

        // Same as in above example
        if (err) {
            logger.info('Error finding access token')
            next(new OAuthError('server_error', 'Error retrieving access token for request'));
            // handle the error
        }
        if (!token) {
            logger.info('No access token found')
            next(new OAuthError('unauthorized_client', 'No matching access token supplied'));
            // no token found - cancel
        }

        if (token.consumed) {
            logger.info('Token has already been consumed')
            next(new OAuthError('unauthorized_client', 'Token has already been consumed'));
            // the token got consumed already - cancel
        }

        logger.info('Updating all tokens')

        // consume all tokens - including the one used
        Token.update({
            userId: token.userId,
            consumed: false
        }, {
            $set: { consumed: true }
        });

        logger.info('Token updated')

        // ready to access protected resources
        next();
    });
};

module.exports = authorize;