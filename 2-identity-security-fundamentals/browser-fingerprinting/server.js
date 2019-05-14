const 	querystring = require('querystring'),
	bodyParser = require('body-parser'),
	https = require('https'),
	express = require('express')
	app = express();

//support JSON & URL encoded bodies
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// All post requests to this endpoint are handled here.
app.get('/capture', function (req, res){

	console.log("Hello, world")

});

app.listen(process.env.PORT || 8000);

