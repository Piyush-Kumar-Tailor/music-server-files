const express = require("express");
const serveIndex = require("serve-index");
const path = require("path");

const app = express();
const port = 3000;

const songsDir = path.join(__dirname, "songs");

app.use((req, res, next) => {
  req.url = decodeURIComponent(req.url);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use("/songs", express.static(songsDir), serveIndex(songsDir, { icons: true }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
