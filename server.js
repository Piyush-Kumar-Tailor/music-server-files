const express = require("express");
const serveIndex = require("serve-index");
const path = require("path");
const app = express();
const port = 3000;

const songsDir = path.join(__dirname, "songs");

// Middleware to decode URL-encoded paths
app.use((req, res, next) => {
  req.url = decodeURIComponent(req.url);
  next();
});

app.use(express.static(__dirname));
app.use("/songs", express.static(songsDir), serveIndex(songsDir, { icons: true }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});