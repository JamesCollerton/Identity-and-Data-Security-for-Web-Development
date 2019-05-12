const bcrypt = require('bcrypt');
const crypto = require('crypto');

function bcrypt_encrypt(username, password) {
	bcrypt.genSalt(10, function(err, salt) {
			console.log("bcrypt username" + username)
			console.log("bcrypt password " + password)
			console.log("bcrypt salt " + salt)
		bcrypt.hash(password, salt, function(err, key) {
			console.log("bcrypt hash " + key)
		});
	});
}

bcrypt_encrypt('James', 'password')
