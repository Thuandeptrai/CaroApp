/* eslint-disable quotes */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const sql = require("mssql");
const uuid = require("uuid");
const checkWin = require("./helper/checkwin");
const bcryptjs = require("bcryptjs");
const authController = require("./controller/authController");
const createRoom = require("./helper/createRoom");
const restartProcess = require("./helper/restartProcess");
const { createServer } = require("http");
const { WebSocketServer } = require("../..");
const chatProcess = require("./helper/chatProcess");
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
const app = express();
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });
const allClient = [];
let allRoom = [];
// define room in
// [ {roomName: uuid.v4(), roomOwner: "user1", roomMember: ["user1", "user2"]}, {roomName: uuid.v4(), roomOwner: "user2", roomMember: ["user1", "user2"]}
wss.on("connection", function (ws) {
  // get ws url
  ws.on("message", async function (message) {
 
    const parseMessage = JSON.parse(message);
 
    switch (parseMessage.type) {
      case "login": {
        try {
          //
          // "Log in" user and set userId to session.
          //
          // Check currentClient contain email
          const user = allClient.find(
            (user) => user.email === parseMessage.data.email
          );
          if(user) {
            return ws.send(
              JSON.stringify({
                type: "notify",
                data: "User is already login",
              })
            );
          }

          const data = await authController.login(
            parseMessage.data,
            ws,
            sqlConfig,
            sql,
            bcryptjs
          );
          const userObj = {
            userId: uuid.v4(),
            v4Id: uuid.v4(),
            ws,
            email: data.email,
          };
          allClient.push(userObj);
          const roomCreate = createRoom(allRoom, userObj)
          allRoom = roomCreate; 
          ws.send(
            JSON.stringify({
              type: "notify",
              data: `You has been add to room ${
                allRoom[allRoom.length - 1].roomName
              }`,
              userKey: userObj.v4Id,
              currentUser: userObj.userId,
            })
          );
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "register": {
        try {
          console.log("register");
          await authController.signUp(
            parseMessage.data,
            ws,
            sqlConfig,
            sql,
            bcryptjs
          );
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "play": {
        try {
          const { roomName, userKey, position } = parseMessage.data;
          const room = allRoom.find((room) => room.roomName === roomName);
          const user = allClient.find((user) => user.v4Id === userKey);

          if (!room || !user) {
            return ws.send(
              JSON.stringify({
                type: "notify",
                data: "Room or user not found",
              })
            );
          }
          if (user.userId === room.turn && room.status === "playing") {
            const { defaultTable } = room;
            if (defaultTable[position.x][position.y] !== 0) {
              return ws.send(
                JSON.stringify({
                  type: "notify",
                  data: "Position is not empty",
                })
              );
            }
            if(position.x > 4 || position.y > 4) {
              return ws.send(
                JSON.stringify({
                  type: "notify",
                  data: "Position is not valid",
                })
              );
            }
            defaultTable[position.x][position.y] = user.userId;
            room.defaultTable = defaultTable;
            room.turn = room.turn === room.userX ? room.userO : room.userX;
            const result = checkWin(defaultTable, user.userId);
            if (result) {
              room.status = "end";
              room.winner = user.userId;
            }
            allRoom[allRoom.findIndex((room) => room.roomName === roomName)] =
              room;
            allClient[allClient.findIndex((user) => user.v4Id === userKey)] =
              user;
            room.roomMember.forEach((member) => {
              const user = allClient.find((user) => user.userId === member);
              user.ws.send(
                JSON.stringify({
                  type: "update",
                  data: room.defaultTable,
                  status: room.status,
                  winner: room.winner,
                  turn: room.turn,
                })
              );
            });
          } else {
            user.ws.send(
              JSON.stringify({
                type: "notify",
                data: "It's not your turn",
              })
            );
          }
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "voteRestart": {
        try {
          const { roomName, userKey } = parseMessage.data;
          const room = allRoom.find((room) => room.roomName === roomName);
          const user = allClient.find((user) => user.v4Id === userKey);
          if (!room || !user) {
            return ws.send(
              JSON.stringify({
                type: "notify",
                data: "Room or user not found",
              })
            );
          }
          return restartProcess(room, user, roomName,  allClient);
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "chat": {
        try {
          const { roomName, userKey, message } = parseMessage.data;
          const room = allRoom.find((room) => room.roomName === roomName);
          const user = allClient.find((user) => user.v4Id === userKey);
          return chatProcess(room, user, message, allClient);
        } catch (err) {
          console.log(err);
        }
      }
    }
  });

  ws.on("error", console.error);

  ws.on("close", function () {
    console.log("stopping client interval");
  });
});

server.listen(8080, function () {
  console.log("Listening on http://localhost:8080");
});
