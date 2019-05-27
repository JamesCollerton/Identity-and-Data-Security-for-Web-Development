var mongoose = require('mongoose');
var uuid = require('node-uuid');

/*
	This is the refresh token that is used to refresh the access token to prevent
	access tokens being used for too long
*/
var RefreshTokenModel = function() {

	var refreshTokenSchema = mongoose.Schema({
		userId: { type: String },
		token: { type: String, default: uuid.v4() },
		createdAt: { type: Date, default: Date.now },
		consumed: { type: Boolean, default: false }
	});

	return mongoose.model('RefreshToken', refreshTokenSchema);
};

module.exports = new RefreshTokenModel();
