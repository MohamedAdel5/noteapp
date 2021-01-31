const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const DbQueryManager = require("../utils/dbQueryManager");

const User = require("../models/UserModel");
const Note = require("../models/NoteModel");

module.exports.me = catchAsync(async (req, res, next) => {
	res.status(200).json({ status: "success", user: req.user.toPublic() });
});


module.exports.myNotes = catchAsync(async (req, res, next) => {
	const notesQueryManager = new DbQueryManager(Note.find({ user: req.user._id }));
	const myNotes = await notesQueryManager.all(req.query);
	const totalSize = await notesQueryManager.totalCount(req.query, Note, {
		user: req.user._id
	});

	res.status(200).json({ 
		status: "success",
		size: myNotes.length,
		totalSize,
		notes: myNotes });
});