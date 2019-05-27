var mongoose = require('mongoose');
var uuid = require('node-uuid');

/*
	This is the authorization code the client issues. Different to the access token which
	will be granted elsewhere in order to give access to resources.
*/
var AuthCodeModel = function() {
	
	var authCodeSchema = mongoose.Schema({
		code: { type: String, default: uuid.v4() },
		createdAt: { type: Date, default: Date.now, expires: '10m' },
		consumed: { type: Boolean, default: false },
		clientId: { type: String },
		userId: { type: String },
		redirectUri: { type: String }
	});

	return mongoose.model('AuthCode', authCodeSchema);
};

module.exports = new AuthCodeModel();
