# noteapp

## Notes:
- I'm using localStorage to store the tokens so testing different users should be done using different browsers.
- Websockets are used for live sharing (Socket.io).
- Whenever any user is typing, others would have the editing disabled from the frontend in order to prevent any conflicts.
- While editing a note. The note changes will be recoreded on the servers memory and shared with people with the share links. The note will not be saved in the db unless someone clicks the save button.
- config.env and config/keys files are uploaded for the sake of this task only but this is not the right thing to do.

## Modules userd:
- Node.js - expressjs framework
- Mongodb - mongoose ODM
- Passport - for authentication
- Socket.io - for live sharing


## How to use it:
- First you need to have node and mongo installed. Also mongodb service should be running.
- clone the repo.
- write in the terminal `npm install`
- make sure that port 3000 is free. If not you have to change the port number in config.env and do find and replace in the front end folder for all endpoints to be mapped to your desired port.
- write in the terminal `npm start`
- visit http://127.0.0.1:3000/ on your browser.
- Password for signup must be 8-50 characters
- to mimic multiple users, User other browsers or incognito tabs.