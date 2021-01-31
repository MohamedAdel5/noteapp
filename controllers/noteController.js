const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Note = require("../models/NoteModel");
const signJwt = require("../utils/signJwt");
const DbQueryManager = require("../utils/dbQueryManager");



module.exports.addNote = catchAsync(async (req, res, next) => {

	let newNote = await Note.create(req.body);
	if(!newNote) throw new AppError('There was a problem in making your note', 500);

	res.status(200).json({
		status: "success",
		note: newNote,
	});
});

module.exports.getNote = catchAsync(async (req, res, next) => {
	let note = await Note.findOne({ _id: req.params.id });
	const noteIdx = ONLINE_NOTES.findIndex(n => n.note._id.toString() === note._id.toString());

	if(req.user._id.toString() !== note.user.toString()){
		if(!req.query || !req.query.token) throw new AppError("missed note jwt token in query params", 400);
		
		const decoded = await promisify(jwt.verify)(req.query.token, PUBLIC_KEY);
		if(!decoded || decoded.sub.toString() !== note._id.toString()) throw new AppError("unauthorized action", 400);
	} 
	if(noteIdx >= 0 && req.query && req.query.online === '1'){
		note = ONLINE_NOTES[noteIdx].note;
	}
	res.status(200).json({
		status: "success",
		note,
	});
});

module.exports.getNotes = catchAsync(async (req, res, next) => {
	const notesQueryManager = new DbQueryManager(Note.find({user: req.user._id}));

	const notes = await notesQueryManager.all(req.query);

	const totalSize = await notesQueryManager.totalCount(req.query, Note, {user: req.user._id});

	res.status(200).json({
		status: "success",
		size: notes.length,
		totalSize,
		notes,
	});
});

module.exports.updateNote = catchAsync(async (req, res, next)  => {
	const note = await Note.findById(req.params.id);
	if(req.user._id.toString() !== note.user.toString()){
		const noteIdx = ONLINE_NOTES.findIndex(n => n.note._id.toString() === note._id.toString());
		if(noteIdx < 0) throw new AppError("note is not found", 404);
		if(!req.query || !req.query.token) throw new AppError("missed note jwt token in query params", 400);
		const decoded = await promisify(jwt.verify)(req.query.token, PUBLIC_KEY);
		if(!decoded || decoded.sub.toString() !== note._id.toString())	throw new AppError('note token is invalid', 400);
		if(decoded.editable !== 1) throw new AppError('unauthorized to edit', 400);
	}
	if(req.body.user) throw new AppError('unauthorized action', 400);
	const updatedNote = await Note.findOneAndUpdate(
		{ _id: req.params.id },
		{ $set: { ...req.body } },
		{ new: true, runValidators: true }
	);
	res.status(200).json({
		status: "success",
		note: updatedNote,
	});
});

module.exports.generateOnlineNoteLink = catchAsync(async (req, res, next) => {
	const note = await Note.findById(req.params.id);
	if(note.user.toString() !== req.user._id.toString()) throw new AppError("unauthorized", 400);
	if(!note) throw new AppError("invalid note id", 400);
	const editTokenObject = signJwt.noteJwt(note._id, 1);
	const viewTokenObject = signJwt.noteJwt(note._id, 0);
	res.status(200).json({
		status: "success",
		editLink: `${process.env.DOMAIN_DEVELOPMENT}:${process.env.PORT}/online-note/${req.params.id}?token=${editTokenObject.token}`,
		viewLink: `${process.env.DOMAIN_DEVELOPMENT}:${process.env.PORT}/online-note/${req.params.id}?token=${viewTokenObject.token}`,

		expiresIn: editTokenObject.expires
	});
});









const generateOnlineNote = function(note, userID)
{
	ONLINE_NOTES.push({
		note,
		connectedClients:[userID]
	});
}

const removeOnlineNote = function(noteIdx)
{
	if(noteIdx < 0) return;
	ONLINE_NOTES.splice(noteIdx, 1);
}

module.exports.getOnlineNote = async (socket, next) => {
	try{
		if(socket.handshake.query && socket.handshake.query.token)
		{
			const decoded = await promisify(jwt.verify)(socket.handshake.query.token, PUBLIC_KEY);
			if(!decoded)	throw new AppError('note token is invalid', 400);
			const note = await Note.findOne({ _id: decoded.sub });
			if(!note)	throw new AppError('note id is invalid', 400);
			const idx = ONLINE_NOTES.findIndex(n => n.note._id.toString() === note._id.toString());
			if(idx < 0)
			{
				generateOnlineNote(note, socket.id);
				socket.noteIdx = 0;
			}
			else
			{
				ONLINE_NOTES[idx].connectedClients.push(socket.id);
				socket.noteIdx = idx;
			}
			socket.canEdit = decoded.editable === 1;
		}
		next();
	}
	catch(err)
	{
		next(err);
	}

};



module.exports.updateOnlineNote = async (socket, msg) => {
	try{

		const msgObj = JSON.parse(msg);
		updatedTitle = msgObj.noteTitle;
		updatedBody = msgObj.noteBody;
		ONLINE_NOTES[socket.noteIdx].note.noteTitle = updatedTitle;
		ONLINE_NOTES[socket.noteIdx].note.noteBody = updatedBody;
	}
	catch(err)
	{
		console.log(err);
	}
};





module.exports.clientDisconnected = (socket) => {
	console.log(`client disconnected with id = ${socket.id}`);
	try{
		const userIdx = ONLINE_NOTES[socket.noteIdx].connectedClients.findIndex(id => id === socket.id);
		ONLINE_NOTES[socket.noteIdx].connectedClients.splice(userIdx, 1);
		if(ONLINE_NOTES[socket.noteIdx].connectedClients.length === 0) removeOnlineNote(socket.noteIdx);
	}
	catch(err)
	{
		console.log(err);
	}
};