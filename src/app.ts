import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { GameData, Player, PlayerUpdateFromClient } from "./types";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const gameData: GameData = {
  players: [],
};

app.use(express.static("static"));

const getRandomIntegerLessThan = (max: number): number => Math.floor(Math.random() * max);

const getRandomColour = (): number => {
  const colours = [
    0xDC143C,  // "crimson"
    0xFF69B4,  // "hot pink"
    0xFF4500,  // "orange red"
    0xFFA500,  // "orange"
    0xFFD700,  // "gold"
    0xF0E68C,  // "khaki"
    0xDDA0DD,  // "plum"
    0x9370DB,  // "medium purple"
    0x6A5ACD,  // "slate blue"
    0x32CD32,  // "lime green"
    0x3CB371,  // "medium sea green"
    0x87CEEB,  // "sky blue"
    0x00008B,  // "dark blue"
    0xD2691E,  // "chocolate"
  ];

  return colours[getRandomIntegerLessThan(colours.length)];
};

io.on("connection", (socket) => {
  console.debug(`Socket ${socket.id} connected`);

  socket.on("request-to-join", (callback: (thisPlayer: Player) => void) => {
    const newPlayer: Player = {
      id: socket.id,
      colour: getRandomColour(),
      x: getRandomIntegerLessThan(800),
      y: getRandomIntegerLessThan(600),
    }
  
    socket.emit("game-data", gameData);
    socket.broadcast.emit("player-connected", newPlayer);
    gameData.players.push(newPlayer);

    callback(newPlayer);
  });

  socket.on("player-update", (playerUpdate: PlayerUpdateFromClient) => {
    socket.broadcast.emit("player-update", {
      id: socket.id,
      ...playerUpdate,
    });
  });

  socket.on("disconnect", () => {
    console.debug(`Socket ${socket.id} disconnected`);
    socket.broadcast.emit("player-disconnected", socket.id);
    gameData.players.splice(gameData.players.findIndex(player => player.id === socket.id), 1);
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

httpServer.listen(3000);
