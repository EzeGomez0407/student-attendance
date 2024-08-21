require("dotenv").config();
const express = require("express");
const server = express();
const cors = require("cors");

// Middlewares
server.use(express.json());
server.use(cors());

// Routes
const index = require("./routes/index");

// use Routes
server.use("/", index);
const port = process.env.PORT;

server.listen(port, () => {
  console.log("servidor abierto en puerto " + port);
});
