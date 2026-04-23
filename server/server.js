const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const state = {
  currentSlide: 0
};

app.use(express.static(path.join(__dirname, "..", "client")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.get("/host", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "host.html"));
});

io.on("connection", (socket) => {
  socket.on("join", (payload = {}) => {
    socket.data.role = payload.role === "host" ? "host" : "guest";

    socket.emit("sync", { currentSlide: state.currentSlide });
    socket.emit("roleAssigned", { role: socket.data.role });
  });

  socket.on("slideChange", (nextIndex) => {
    if (socket.data.role !== "host") {
      return;
    }

    if (typeof nextIndex !== "number" || Number.isNaN(nextIndex)) {
      return;
    }

    const safeIndex = Math.max(0, Math.floor(nextIndex));
    state.currentSlide = safeIndex;
    io.emit("sync", { currentSlide: state.currentSlide });
    io.emit("playSound", { type: "ding" });
  });

});

server.listen(PORT, () => {
  console.log(`SyncSlide MVP server running on http://localhost:${PORT}`);
});
