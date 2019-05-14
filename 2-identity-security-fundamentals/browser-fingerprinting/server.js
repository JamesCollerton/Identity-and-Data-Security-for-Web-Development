const 	querystring = require('querystring'),
	bodyParser = require('body-parser'),
	https = require('https'),
	express = require('express')
	app = express();

//support JSON & URL encoded bodies
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

console.log("Bringing up server")

app.listen(process.env.PORT || 8000);

