/* eslint-disable quotes */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
"use strict";

const session = require("express-session");
const express = require("express");
const http = require("http");
const uuid = require("uuid");
const bcryptjs = require('bcryptjs')
const sql = require("mssql");

const { WebSocketServer } = require("../..");

function onSocketError(err) {
  console.error(err);
}

const app = express();
const map = new Map();

//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
  saveUninitialized: false,
  secret: "$eCuRiTy",
  resave: false,
});

const sqlConfig = {
  user: "ThuanTest1",
  password: "123456",
  database: "CaroApp",
  server: "localhost",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    trustServerCertificate: true,
  },
};
//
// Serve static files from the 'public' folder.
//
app.use(express.static("public"));
app.use(sessionParser);
const connectDb = async () => {
  try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(sqlConfig);
    console.log("connect db success");
    const query = `
    CREATE TABLE userTable (
      id INT PRIMARY KEY,
      name VARCHAR(100),
      age INT,
      email VARCHAR(100),
      password VARCHAR(100)
    );
  `;
  (await sql.connect(sqlConfig)).query(query);
  } catch (err) {
    console.log(err);
    // ... error checks
  }
};
connectDb();
app.post("/login", function (req, res) {
  //
  // "Log in" user and set userId to session.
  //
  const id = uuid.v4();

  console.log(`Updating session for user ${id}`);
  req.session.userId = id;
  res.send({ result: "OK", message: "Session updated" });
});
// app.post("/signUp", async function  (req, res) {
//   try {


//   } catch (err){
//     console.log(err);
//   }
// });

app.delete("/logout", function (request, response) {
  const ws = map.get(request.session.userId);

  console.log("Destroying session");
  request.session.destroy(function () {
    if (ws) ws.close();

    response.send({ result: "OK", message: "Session destroyed" });
  });
});

//
// Create an HTTP server.
//
const server = http.createServer(app);

//
// Create a WebSocket server completely detached from the HTTP server.
//
const wss = new WebSocketServer({ clientTracking: false, noServer: true });

server.on("upgrade", function (request, socket, head) {
  socket.on("error", onSocketError);

  console.log("Parsing session from request...");

  sessionParser(request, {}, () => {
    if (!request.session.userId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    // getRoomId via url

    socket.removeListener("error", onSocketError);

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit("connection", ws, request);
    });
  });
});
var id = 0;
const allClients = [];
wss.on("connection", function (ws, request) {
  const userId = request.session.userId;
  console.log("userId", userId);
  allClients.push({ userId, ws, roomId: request.roomId });
  // Check total clients in room if > 2 => return client.ws.send('room is full')
  let totalClients = 0;
  allClients.forEach((client) => {
    if (client.roomId === request.roomId && client.userId !== userId) {
      totalClients++;
    }
  });
  if (totalClients == 0) {
    ws.send(
      JSON.stringify({
        type: "X",
        message: "You are the first player",
        status: "waiting",
      })
    );
  } else if (totalClients === 1) {
    allClients.forEach((client) => {
      // Send other client that you are ready
      if (client.roomId === request.roomId && client.userId !== userId) {
        client.ws.send(JSON.stringify({ status: "ready" }));
      }
      ws.send(
        JSON.stringify({
          type: "Y",
          message: "You are second player",
          status: "ready",
        })
      );
    });
  } else {
    ws.send(JSON.stringify({ type: "z", message: "Room is full" }));
    ws.close();
  }
  map.set(userId, ws);
  ws.on("error", (error) => {
    console.log("error", error);
  });
  ws.on("message", function (message) {
    console.log(`Received message ${message} from user ${userId}`);
    allClients.forEach((client) => {
      if (client.roomId === request.roomId) {
        if (client.userId !== userId) {
          // If client is not sender set filed yourTurn = true
          const data = JSON.parse(message);
          const finalData = {
            ...data,
            yourTurn: true,
          };
          client.ws.send(JSON.stringify(finalData));
        } else {
          const data = JSON.parse(message);
          const finalData = {
            ...data,
            yourTurn: false,
          };
          client.ws.send(JSON.stringify(finalData));
        }
      }
    });
  });

  ws.on("close", function () {
    // pull allClients
    const index = allClients.findIndex((client) => client.userId === userId);
    allClients.splice(index, 1);
    map.delete(userId);
  });
});

//
// Start the server.
//
server.listen(8080, function () {
  console.log("Listening on http://localhost:8080");
});
