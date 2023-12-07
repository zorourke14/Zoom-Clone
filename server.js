const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
  let roomId; // Define roomId variable

  socket.on('join-room', (room, userId) => {
    roomId = room; // Assign the value of room to the roomId variable
    socket.join(room);
    socket.to(room).broadcast.emit('user-connected', userId);

    socket.on('chat-message', data => {
      // Broadcast the chat message to all clients in the same room
      //socket.broadcast.to(room).emit('chat-message', data);
      io.to(room).emit('chat-message', data);
    });

    socket.on('disconnect', () => {
      io.to(room).emit('user-disconnected', userId);
    });
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
