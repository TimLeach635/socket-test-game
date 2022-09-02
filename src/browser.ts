import { io } from "socket.io-client";

const socket = io();

const things = document.getElementById("things");

socket.on("event", (msg) => {
  const newItem = document.createElement("li");
  newItem.textContent = msg;
  things?.appendChild(newItem);
  window.scrollTo(0, document.body.scrollHeight);
});
