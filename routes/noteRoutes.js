const express = require("express");
const notesController = require("../controllers/noteController");
const authenticationController = require("../controllers/authenticationController");

const router = express.Router();

router
	.route("/")
	.post(
		authenticationController.protect(),
		notesController.addNote
	);

router.route("/").get(authenticationController.protect(), notesController.getNotes);

router.route("/:id").get(authenticationController.protect(), notesController.getNote);

router.route("/:id").patch(authenticationController.protect(), notesController.updateNote);

// router.route("/online-note/:id").patch(notesController.updateNoteByOthers);

router.route("/generate-online-note/:id").get(authenticationController.protect(), notesController.generateOnlineNoteLink);







module.exports = router;
