const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const generatePasswordHashAndSalt = require("../utils/generatePasswordHashAndSalt");
const verifyPassword = require("../utils/verifyPassword");
const signJwt = require("../utils/signJwt");
const User = require("../models/UserModel");
const { promisify } = require('util');
const jwt = require('jsonwebtoken');


const passport = require("passport");


module.exports.login = catchAsync(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		//Invalid email
		throw new AppError("Invalid email or password", 401);
	}

	const isValid = verifyPassword(req.body.password, user.passwordHash, user.passwordSalt);
	if (!isValid) {
		//Invalid password
		throw new AppError("Invalid email or password", 401);
	}

	//Valid email & pass
	const tokenObject = signJwt.authJwt(user._id);
	const publicUser = user.toPublic();
	res.status(200).json({
		status: "success",
		token: tokenObject.token,
		expiresIn: tokenObject.expires,
		user: publicUser,
	});
});

module.exports.signup = catchAsync(async (req, res, next) => {
	const { name, email, password } = req.body;

	User.validatePassword(password); //If there is an error it would be caught by catchAsync.
	const passwordObject = generatePasswordHashAndSalt(password);
	const passwordSalt = passwordObject.salt;
	const passwordHash = passwordObject.hash;

	let newUser = new User({
		name,
		email,
		passwordHash,
		passwordSalt,
	});

	newUser = await newUser.save(); //If there is an error it would be caught by catchAsync.

	const tokenObject = signJwt.authJwt(newUser._id);
	const publicUser = newUser.toPublic();
	res.status(200).json({
		status: "success",
		token: tokenObject.token,
		expiresIn: tokenObject.expires,
		user: publicUser,
	});
});



module.exports.protect = () => {
	return passport.authenticate("jwt", { session: false });
};

module.exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		const myRole = req.user.constructor.modelName;

		if (!roles.includes(myRole))
			return next(
				new AppError(
					`You are unauthorized. This route is restricted to certain type of users.`,
					401
				)
			);
		else return next();
	};
};


exports.protectWs = async (socket, next) => {
	try{
		if (socket.handshake.headers && socket.handshake.headers.authorization){
			const decoded = await promisify(jwt.verify)(socket.handshake.headers.authorization.split(' ')[1], PUBLIC_KEY);
			if(!decoded)	throw new AppError('Authentication error', 400);
			const user = await User.findOne({ _id: decoded.sub });
			socket.user = user;
			next();
		}
		else{
			throw new AppError('Authentication error', 400);
		}
	}
	catch(err)
	{
		next(err);
	}
	// if (socket.handshake.query && socket.handshake.query.token){
  //   jwt.verify(socket.handshake.query.token, PUBLIC_KEY, async function(err, decoded) {
	// 		if (err) return next(new AppError('Authentication error', 400));
	// 		console.log(decoded);
	// 		const user = await User.findOne({ _id: decoded.sub });
  //     socket.user = user;
  //     next();
  //   });
  // }
  // else {
  //   next(new AppError('Authentication error', 400));
  // } 
};
