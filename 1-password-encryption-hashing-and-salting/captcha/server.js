const 	querystring = require('querystring'),
	bodyParser = require('body-parser'),
	https = require('https'),
	express = require('express')
	app = express();

const 	secureConfig = require('./secure-config/secure-config.js')

//support JSON & URL encoded bodies
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// All post requests to this endpoint are handled here.
app.post('/capture', function (req, res){

	// We know the response contains this, so extract it.
	var response = req.body['g-recaptcha-response'];

	console.log(secureConfig.secret_key)

	var verify_data = querystring.stringify({
		'secret' : secureConfig.secret_key,
		'response': response
	});

	//uber access token fetch endpoint
	var verify_options = {
		host: 'google.com',
		path: '/recaptcha/api/siteverify',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': verify_data.length
		}
	};

	//set up request
	var post_req = https.request(verify_options, function(result){
		result.setEncoding('utf8');
	
		result.on('data', function (verification){
			console.log(verification);
		});
	});

	//post data
	post_req.write(verify_data);
	post_req.end();
});

app.listen(process.env.PORT || 8000);

