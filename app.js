const express = require('express'); 
const app = express(); 

const server = require('http').Server(app);

const db = require('./config/keys_dev').mongoURI;

const mongoose = require('mongoose'); 
const bodyParser = require('body-parser'); 
const passport = require('passport'); 

const users = require('./routes/api/users'); 
const tweets = require('./routes/api/tweets'); 
// const chat = require('./routes/chat');

// const User = require('./models/User'); 

//new code
const socket = require('socket.io');
//new code end

mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('Connected to mongoDB'))
    .catch(err => console.log(err)); 

app.use(passport.initialize()); 
require('./config/passport')(passport); 

app.use(bodyParser.urlencoded({
    extended: false 
})); 
app.use(bodyParser.json()); 


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});
// app.get("/", (req, res) => {
//     res.send("Hello Wd!"); 
// }); 

app.use("/api/users", users); 
app.use("/api/tweets", tweets); 
// app.use('/chat', chat);
const port = process.env.PORT || 5000; 

//COMMENTED OUT
// app.listen(port, () => {
//     console.log(`Listening on port ${port}`)
// }); 
// COMMENTED OUT END

//new code
server.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

const io = socket(server);

let possible_rooms = {};
let created_rooms = [];
let users_in_rooms = [];

io.on('connection',onConnect) 

function onConnect(socket) {
    console.log('made socket connection');
    console.log(socket.id);


    function remove_user_from_possible_rooms (socketid) {
        Object.keys(possible_rooms).forEach(function(room_id) {
            if (possible_rooms[room_id] == socketid) {
                delete possible_rooms[room_id]
            }
        });
    } 
    // console.log(socket.id);
    // socket.on('chat_message', (user_message) => {
    //     io.sockets.emit('display_message', user_message)

    socket.on('request_room', (room_ids) => {
        const possible_room_ids = Object.keys(possible_rooms);
        const users_in_possible_rooms = Object.values(possible_rooms);

        if (possible_room_ids.includes(room_ids[0])) {
            
            console.log('found first room');
            socket.emit('possible_room', room_ids[0] );
            socket.emit('verified_room', room_ids[0] );
            const other_socketid = possible_rooms[room_ids[0]];
            io.to(other_socketid).emit('verified_room', room_ids[0]);
            remove_user_from_possible_rooms(other_socketid);
            console.log(possible_rooms);

        } else if (possible_room_ids.includes(room_ids[1])) {

            console.log('found second room');
            socket.emit('possible_room', room_ids[1]);
            socket.emit('verified_room', room_ids[1]);
            const other_socketid = possible_rooms[room_ids[1]];
            io.to(other_socketid).emit('verified_room', room_ids[1]);
            remove_user_from_possible_rooms(other_socketid);
            console.log(possible_rooms);

        } else {

            remove_user_from_possible_rooms(socket.id);
            possible_rooms[room_ids[0]] = socket.id;
            console.log(socket.id);
            console.log(possible_rooms);
            socket.emit('possible_room', room_ids[0] );

        }
        
    });



    socket.on('off', () => {
        remove_user_from_possible_rooms(socket.id)
        socket.disconnect();
    })

}




//new code end

// module.exports = {
//     port
// }


