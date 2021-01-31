const User = require("../models/UserModel");
const Note = require("../models/NoteModel");

const users = require("../models/seeds/userSeeds");
const notes = require("../models/seeds/noteSeeds");

const logger = require("../utils/logger");


const initializeDB = async () => {
	logger.log('info', `⏳ Checking DB.`);
	const usersCount = (await User.find()).length;
	const notesCount = (await Note.find()).length;

	if((usersCount > 0 && notesCount  > 0))
	{
		logger.log('info', `✅ DB is okay.`);
		return;
	}
	logger.log('info', `🏁 DB is not initialized. Started db seeding...`);

	if( usersCount <= 0)
	{
		logger.log('info', `✅ Global variables are seeded --> count = ${usersCount}`);
		await User.insertMany(users.dbSeeds);
	}
	if(notesCount  <= 0)
	{
		logger.log('info', `✅ General products are seeded --> count = ${notesCount}`);
		await Note.insertMany(notes.dbSeeds);
	}

	logger.log('info', `✅ Finished db seeding successfully`);
};
module.exports = initializeDB;

