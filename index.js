const express = require('express');
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messagesRoute');
const chatroomRoutes = require('./routes/chatroomRoute');
const chatroomMessagesRoutes = require('./routes/chatroomMessageRoute');
const socket = require('socket.io');

const origin = 'http://localhost:5173';

const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.get('/',(req,res)=>{ return res.send('working api')});
app.use('/api/auth', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatroom', chatroomRoutes);
app.use('/api/chatroommessage', chatroomMessagesRoutes);


mongoose.connect(`${process.env.DATABASE_URI}${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("DB connected successfully");
}).catch((err)=>console.log("error:", err));

const server = app.listen(process.env.PORT, ()  =>{
    console.log('server started on  port:', process.env.PORT);
})

const io = socket(server, {
    cors:{
        origin: origin,
        credentials: true,
    }
})


global.onlineUsers = new Map();
global.ChatroomUsers = new Map();

io.on('connection', (socket) => {
    global.chatSocket = socket;

    socket.on('add-user', (userId) => {
        console.log('add chatrom user', userId, socket.id);
        // Correctly set userId and socket.id into the onlineUsers map
        global.onlineUsers.set(userId, socket.id);
    });

    socket.on('send-msg', (data) => {
        console.log(global.onlineUsers);
        console.log('socket data', data);
        const sendUserSocket = global.onlineUsers.get(data.to);
        console.log('sendUserSocket', sendUserSocket);
        if (sendUserSocket) {
            console.log('data.msg', data.message);
            socket.to(sendUserSocket).emit('msg-recieve', data.message);
        }
    });
// for chatroom socket

    // Join a room when a user connects
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room ${roomId}`);
    });


    // Handle message events
    socket.on('chatroom-sendMessage', (roomId, message) => {
        // Broadcast the message to all users in the room
        console.log('roomid and then msg', roomId, message);
        io.to(roomId).emit('message', message);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

