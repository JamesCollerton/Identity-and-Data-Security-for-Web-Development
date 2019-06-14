var mongoose = require('mongoose');
var uuid = require('node-uuid');

/*
	This is the actual access token itself. It can be paired with a refresh token
	so that it refreshes after 3 minutes
*/
var TokenModel = function() {

	var tokenSchema = mongoose.Schema({
		userId: { type: String },
		refreshToken: { type: String, unique: true },
		idToken : { type: String },
		accessToken: { type: String, default: uuid.v4 },
		expiresIn: { type: String, default: '10800' },
		tokenType: { type: String, default: 'bearer' },
		consumed: { type: Boolean, default: false },
		createdAt: { type: Date, default: Date.now, expires: '3m' }
	});

	return mongoose.model('Token', tokenSchema);
};

module.exports = new TokenModel();
