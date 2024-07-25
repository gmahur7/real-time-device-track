require('dotenv').config;
const express = require('express');
const app= express();
const cors = require('cors')

const port = process.env.PORT || 7500;
app.use(cors())


const http = require('http');
const path = require('path');
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

app.set("view engine","ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,"public")))

io.on("connection",(socket)=>{
    console.log('New client connected:', socket.id);

    socket.on("send-location",(data)=>{
        console.log('Location data received from:', socket.id);
        io.emit("recieve-location",{
            id:socket.id,
            ...data
        })
    })
    console.log("connected")

    socket.on("disconnect",()=>{
        console.log('Client disconnected:', socket.id);
        io.emit("user-disconnected",{id:socket.id})
    })
})

app.get("/",(req,resp)=>{
    resp.render("index",{ title: 'Welcome' })
})

server.listen(port,()=>{
    console.log("Server is running @ ",port)
})