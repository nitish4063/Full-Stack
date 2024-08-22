import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

function App() {
  const [messages, setMessages] = useState([]);

  const [msg, setMsg] = useState("");
  const [room, setRoom] = useState("");
  const [socketId, setSocketId] = useState("");
  const [roomName, setRoomName] = useState("");

  const socket = useMemo(
    () => io("http://localhost:3000", { withCredentials: true }),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { msg, room });
    setMsg("");
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log("CONNECTED, ID: ", socket.id);
    });

    socket.on("welcome", (data) => {
      console.log(data);
    });

    socket.on("receive-message", (data) => {
      console.log("message received => ", data);
      setMessages((cur) => [data, ...cur]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" component="div" gutterBottom>
        {socketId}
      </Typography>

      <form onSubmit={handleJoinRoom}>
        <TextField
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          id="outlined-basic"
          label="Room Name"
          variant="outlined"
        />

        <Button type="submit" variant="contained" color="primary">
          Join Room
        </Button>
      </form>

      <form onSubmit={handleSubmit}>
        <TextField
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          id="outlined-basic"
          label="message"
          variant="outlined"
        />
        <TextField
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          id="outlined-basic"
          label="Room ID"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </form>

      {messages.map((mess, i) => (
        <Typography key={i} variant="h6" component="div" gutterBottom>
          {mess}
        </Typography>
      ))}
    </Container>
  );
}

export default App;
