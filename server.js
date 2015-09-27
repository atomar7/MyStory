var express = require('express');
var bodyparser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

mongoose.connect ("mongodb://root:password@ds041633.mongolab.com:41633/userstory", function(err){
	if (err) {
		console.log(err);
	} else{
		console.log('connected to the database');
	}
});

//these are middlewares
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(morgan('dev'));


//new middileware to render public files
// if not this to index.html to render css or js later on. render all static files
//this means that we have setup our root ro public directory. as in below route we can directly 
//write path considering we are in this folder
app.use(express.static(__dirname +'/public'));

// here app and express needs to be passed as api has these being used. if not passed it will treat as local varibale
var api = require('./app/route/api')(app, express, io);

// this is route middleware. shows the path and api method
app.use('/api', api);

app.get('*', function(req, res){
	res.sendFile(__dirname + '/public/app/views/index.html');
});

http.listen(config.port, function(err){
	if(err){
		console.log(err);
	}else{
		console.log('listening on port 9040');
	}
});