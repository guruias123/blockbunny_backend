const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors()); // Enable CORS for all HTTP requests

const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('BlockBunny backend is running');
});

const io = new Server(server, {
  path: '/socket', // Match frontend socket path
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('new-message', (message) => {
    io.to(`conversation:${message.conversation_id}`).emit('message-received', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});

module.exports = { io };