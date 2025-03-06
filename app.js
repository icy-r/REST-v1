require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT ? process.env.PORT : 3000;
const mongoURI = process.env.MONGO_URI;

console.log(mongoURI);

mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});
app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Finance Tracker is listening at http://localhost:${port}`);
});
