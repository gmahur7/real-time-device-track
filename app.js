require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 7500;
app.use(cors())

const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['polling'], // Force long-polling
  allowEIO3: true // Allow Engine.IO 3 compatibility
});

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")))

io.on("connection", (socket) => {
  console.log('New client connected:', socket.id, 'Total clients:', io.engine.clientsCount);
  
  socket.on("send-location", (data) => {
    console.log('Location data received from:', socket.id, 'Data:', JSON.stringify(data));
    io.emit("recieve-location", {
      id: socket.id,
      ...data
    });
  });

  socket.on("disconnect", (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason, 'Remaining clients:', io.engine.clientsCount);
    io.emit("user-disconnected", { id: socket.id });
  });
});

app.get("/", (req, resp) => {
  resp.render("index", { title: 'Welcome' });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

server.listen(port, () => {
  console.log("Server is running @ ", port);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

io.on('connect_error', (error) => {
  console.error('Socket.IO error:', error);
});