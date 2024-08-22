import express from "express";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const PORT = 3000;
const app = express();
const secretKeyJWT = "!bdofbsfosb23ey37!";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "1508" }, secretKeyJWT);

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      msg: "LOGIN SUCCESS",
    });
});

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication Error"));

    const decoded = jwt.verify(token, secretKeyJWT);
    next();
  });
});

io.on("connection", (socket) => {
  console.log("User Connected with id: ", socket.id);

  // socket.emit("welcome", `WELCOME TO THE SERVER ${socket.id}`);
  // socket.broadcast.emit("welcome", `${socket.id} joined the server`);

  socket.on("message", ({ msg, room }) => {
    console.log("message from frontend: ", msg);

    // SEND TO EVERYONE
    // io.emit("receive-message", data);

    //  SEND TO EVERYONE EXCEPT MYSELF
    // socket.broadcast.emit("receive-message", data);

    // SEND TO SOME SPECIFIC USERS
    socket.to(room).emit("receive-message", msg);
  });

  socket.on("join-room", (roomName) => {
    console.log("Someone Joined the Room: ", roomName);
    socket.join(roomName);
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED", socket.id);
  });
});

server.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
