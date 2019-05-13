const crypto = require('crypto')

// We create a salt and add it to our password. Then when we hash the two we can
// avoid lookups from dictionary, rainbow and reverse lookup tables.

// We generate the salt, save the salt and then recombine it with the password when
// it is submitted.
crypto.randomBytes(32, function(ex, salt){
	//log readable string version of the salt
	console.log('salt: ' + salt.toString('hex'));
	//proceed to next step: using the salt
});
