const socketIO = require('socket.io');
const authenticationController = require("../controllers/authenticationController");
const noteController = require("../controllers/noteController");


module.exports = (server)=>{
	const io = socketIO(server, {
		path: "/ws/online-note",
		cors:{
			origin: "*"
		},
		pingInterval: 10000,
		pingTimeout: 5000,
		serveClient: false
	});
	//For authentication on connection
	io.use(authenticationController.protectWs);
	io.use(noteController.getOnlineNote);
	io.on('connection', (socket) => {
		console.log(`a client connected with id ${socket.id}`);
		
		socket.on("note-update", (updatedNote)=>{
			if(socket.canEdit)
				noteController.updateOnlineNote(socket, updatedNote);
			for(clientID of ONLINE_NOTES[socket.noteIdx].connectedClients)
			{
				socket.broadcast.to(clientID).emit("note-update", updatedNote);
			}
		});

		socket.on('disconnect', () => {
			noteController.clientDisconnected(socket);
		});
	});
}