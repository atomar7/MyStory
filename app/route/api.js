var User = require('../models/user');
var config = require('../../config');
var secretKey = config.secretKey;
var jsonwebtoken = require('jsonwebtoken');
var Story = require('../models/story');

function createToken(user){
	var token = jsonwebtoken.sign({
		id: user._id,
		name: user.name,
		username: user.username
	}, secretKey, {
		expiresInMinute: 1400
	});
	return token;
}

module.exports = function(app, express, io){
	var api = express.Router();

	api.get('/all_stories', function(req, res){
		Story.find({}, function(err, stories){
			if(err){
				res.send(err);
				return;
			}
			res.json(stories);
		});
	});

	//when this api is called it will be called with /signup with post method
	api.post('/signup', function(req, res){
			var user = new User({
			name : req.body.name,
			username: req.body.username,
			password: req.body.password
		});
		var token = createToken(user);	
		user.save(function(err){
			if(err){
				res.send(err);
				return
			}
			res.json({
				message: true,
				message: 'User has been created',
				token: token
			});
		});
	});

	api.get('/users', function(req,res){

		//this find is a mongoose method shich will find all user objects in database
		User.find({}, function(err, users){
			if(err){
				res.send(err);
				return;
			}
			res.json(users);
		});
	});

	//login api
	api.post('/login', function(req,res){
		//monggosse to find a specific user object
		User.findOne({
			username: req.body.username	
		}).select('name username password').exec(function(err,user){
			if(err) throw err;

			if(!user){
				res.send({message:'User not there'});
			} else if (user){
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword){
					res.send({message: "Invalid Password"});
				} else{
					///token creation for valid password
					var token = createToken(user);

					res.json({
						success: true,
						message: "Successful login",
						token:token
					});
				}
			}

		});
	});

//middleware to see that token should be there when you call any of the api
	api.use(function(req, res, next){
		console.log("Someone just visited app");
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		//check if token exists
		if(token){
			jsonwebtoken.verify(token, secretKey, function(err, decoded){
				if(err){
					res.status(403).send({success :false, message: "Failed authentication"});
				} else{
					req.decoded = decoded;
					next();
				}
			});

		}else{
			res
		}
	});

	//once above method is written, all below methods can be accessed using this middleware
	//all things above this method is des a and below is des b.

	//api.get('/', function(req, res){
	//	res.json("Hellow Eowld");
	//});

	api.route('/')
		.post(function(req, res){
			var story = new Story({
				creator: req.decoded.id,
				content: req.body.content
			});

			story.save(function(err, newStory) {
				if(err){
					res.send(err);
					return
				}	
				io.emit('story', newStory)
				res.json({message: "New story created"});			
			});
		})

		.get(function(req, res){
			Story.find({ creator: req.decoded.id}, function(err, stories) {
				if(err){
					res.send(err);
					return;
				}
				res.json(stories);
			});
		});

		//decoded api
		api.get('/me', function(req,res){
			res.json(req.decoded);
		});

	return api
}