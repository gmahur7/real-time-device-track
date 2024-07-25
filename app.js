require('dotenv').config;
const express = require('express');
const app= express();

const port = process.env.PORT || 7500;

const http = require('http');
const path = require('path');
const socketio = require("socket.io");
const server = http.createServer(app);
const io=socketio(server);

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")))

io.on("connection",(socket)=>{
    socket.on("send-location",(data)=>{
        io.emit("recieve-location",{
            id:socket.id,
            ...data
        })
    })
    console.log("connected")

    socket.on("disconnect",()=>{
        io.emit("user-disconnected",{id:socket.id})
    })
})

app.get("/",(req,resp)=>{
    resp.render("index")
})

server.listen(port,()=>{
    console.log("Server is running @ ",port)
})