const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Easy to handle for CPU, hard for GPU so resistant to GPU updates
// Slow, which is good as takes longer for iterations
function bcrypt_encrypt(username, password) {
	console.log("bcrypt username " + username)
	console.log("bcrypt password " + password)
	bcrypt.genSalt(10, function(err, salt) {
		console.log("bcrypt salt " + salt)
		bcrypt.hash(password, salt, function(err, key) {
			console.log("bcrypt hash " + key)
			console.log("bcrypt Store the salt: " + salt + " and hash: " + key)
		});
	});
}

bcrypt_encrypt('James', 'password')

// Time tested
// Recommended by NIST
// Used by LastPass etc.
// Available as standard with native crypto library
function pbkdf2_encrypt(username, password){
	console.log("pbkdf2 username " + username)
	console.log("pbkdf2 password " + password)
	crypto.randomBytes(32, function(ex, salt){
		console.log("pbkdf2 salt " + salt.toString('hex'))
		crypto.pbkdf2(password, salt, 4096, 512, 'sha256', function(err, key) {
			if (err) throw err;
			let hash = key.toString("hex")
			console.log("pbkdf2 hash " + hash) 
			console.log("pbkdf2 Store the salt: " + salt.toString('hex') + " and hash: " + hash)
		});
	});
}

pbkdf2_encrypt('James', 'password')

// Scrypt

// Library doesn't work at the minute, but the point of this algorithm is that it's purposefully hardware intensive. It can take in things like N, the maximum amount of time it takes in seconds, r, the maximum number of RAM bytes, p the fraction of available RAM used when computing the derived key.
