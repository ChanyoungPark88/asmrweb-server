const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const colors = require('colors');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT;
const messages = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// app.use('/api/messages', messageRoutes);

app.get('/api', (req, res) => {
  res.send('API is Running');
});

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const messageLog = req.body.messageLog;
  messageLog.forEach((e) => messages.push(e));
});

// Form here Realtime Socket PART
const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'https://asmrweb.vercel.app/',
    methods: ['GET', 'POST'],
  },
});
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} is joined room: ${data}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
    // console.log(data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
    socket.leave(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`.yellow.bold);
});

module.exports = server;
