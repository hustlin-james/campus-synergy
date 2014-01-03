
/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var xml2js = require('xml2js');
var nodemailer = require('nodemailer');
var routes = require('./routes');
var port = process.env.PORT || 3000;
//var path = require('path');
var gapi = require('./lib/gapi');
var fb_api = require('./lib/fbapi');
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var parser = new xml2js.Parser();
var buildingsJSON = new Array();

fs.readFile('./buildings.xml', function(err, data){
	parser.parseString(data, function(err, result){
		var myArray = result['resources']['Building'];
		for(var i = 0; i < myArray.length; i++){

			var latLongArray = new Array();
			var myPoints = myArray[i]['point'];
			for(var j = 0; j < myPoints.length; j++){
				var lat;
				var lng;

				if( (j+1) % 2 == 0){
					lng = myPoints[j]['_'];
					latLongArray.push({'lat':lat, 'lng':lng});
				}else{
					lat = myPoints[j]['_'];
				}
			}
			var buildingName = myArray[i]['$']['name'];
			//console.log(latLongArray);
			buildingsJSON.push({'name':buildingName, 'coordinates':latLongArray});
		}
	});
});
routes.init(buildingsJSON, gapi, fb_api);
// Routes
app.get('/', routes.index);
app.get('/buildings_json', routes.buildingsJson);
app.get('/fb_code', function(req, res){
	var code = req.query.code;
	//Redirect to the index page with the code in the parameters and fb_code=true
	//console.log('fb_code: '+code);
	var url = '/?code='+code + '&whichapi='+'fb';
	res.redirect(url);
});
app.post('/sendemail', function(req, res){
	var contactUsSubject = req.body.contactUsSubject;
	var contactUsFromEmail = req.body.contactUsFromEmail;
	var contactUsBody = req.body.contactUsBody;

	//Not doing for now...
	//console.log('contactUsSubject: ' + contactUsSubject);
	//console.log('contactUsFromEmail: ' + contactUsFromEmail);
	//console.log('contactUsBody: ' + contactUsBody);

	res.send('success');
});

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
