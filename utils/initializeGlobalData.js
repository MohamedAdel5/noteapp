module.exports = async function () {
	//Array of notes, each with structure like this:
	// {
	// 		note: {
	// 			_id: "1jhGweHmOj91BA12",
	// 			noteTitle: "..",
	// 			noteBody: ".."
	// 		},
	// 		connectedClients: ["PiYXG970ZeiRNZgyAAAD", "PiYXG970ZeiRNZgyAAAD"]
	// }
	let ONLINE_NOTES = [];
	global.ONLINE_NOTES = ONLINE_NOTES;
};
