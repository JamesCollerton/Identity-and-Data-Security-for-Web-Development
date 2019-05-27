var Token = require('../models/token');

/*
    Token middleware. 
    
    The authorize end point is used to give out an authorization token, the token end point
    consumes the authorization token and gives out an access token, this middleware is used to
    make sure that each request has a valid access token associated with it.
*/
var authorize = function(req, res, next) {
    var accessToken;
    
    // check the authorization header
    if (req.headers.authorization) {
        
        // validate the authorization header
        var parts = req.headers.authorization.split(' ');
        
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
        
    if (!accessToken) {
        // no access token got provided - cancel with a 401
    }
    Token.findOne({
        accessToken: accessToken
    }, function(err, token) {
        // Same as in above example
        if (err) {
            // handle the error
        }
        if (!token) {
            // no token found - cancel
        }
        
        if (token.consumed) {
            // the token got consumed already - cancel
        }
                
        // consume all tokens - including the one used
        Token.update({
            userId: token.userId,
            consumed: false
        }, {
            $set: { consumed: true }
        });
        // ready to access protected resources
        next();
    });
};

module.exports = authorize;