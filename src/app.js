import express from "express";
import handlebars from 'express-handlebars'
import { __dirname } from './utils.js';
import { Server } from "socket.io";
import viewsRouter from "./routes/viewsrouter.js";
import productsRouter from './routes/ProductManager.router.js';
import cartsRouter from "./routes/carts.router.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import ChatManager from "./dao/dbManager/chat.manager.js";
const chatManager= new ChatManager();

import path from 'node:path';
const productsFilePath = path.join(__dirname, "./files/productos.json");


const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');
app.use('/', viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts",cartsRouter);
app.use((req, res) => {
res.status(404).send('Error 404: Page Not Found');
  });

try{
    await mongoose.connect("mongodb+srv://gabrielescarate33:Xo9mD8WITwByoebt@cluster55575ge.cox6brd.mongodb.net/segundaentregamongo?retryWrites=true&w=majority");
    console.log("Connected to DB");
}
catch(error){console.log(error.message)};
const server= app.listen(8080, ()=>console.log("Server running"));

const io = new Server(server);
app.set("socketio",io);


io.on("connection",async(socket) =>{
    const messages = await chatManager.getAll();
    console.log("Nuevo cliente conectado");
    socket.on("authenticated",data=>{
    socket.emit("messageLogs",messages); 
});

    socket.on("message",async(data)=>{
   
    await chatManager.save(data);
    const newMessage = await chatManager.getAll();
    io.emit("messageLogs",newMessage) 
})

})