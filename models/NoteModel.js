const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: [true, "The user id must be specified."],
		},
		noteTitle: {
			type: String,
			required: [true, "Note title must be specified"]
		},
		noteBody: {
			type: String,
			required: [true, "Note body must be specified"],
		}
	},
	{
		strict: "throw",
	}
);


const Note = mongoose.model("Note", NoteSchema);
module.exports = Note;
