/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const sql = require("mssql");
const uuid = require("uuid");
const bcryptjs = require("bcryptjs");
const authController = require("./controller/AuthController");

const { createServer } = require("http");
const { WebSocketServer } = require("../..");
const roomController = require("./controller/RoomController");
const {
  loginFail,
} = require("./handler/sendNotifyForResponse");
const sqlConfig = require("./config/sqlconfig");
const userController = require("./controller/UserController");
const app = express();
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", function (ws) {
  const newAuthClass = new authController(ws, sqlConfig, sql, bcryptjs);
  ws.on("message", async function (message) {
    const parseMessage = JSON.parse(message);
    switch (parseMessage.type) {
      case "login": {
        try {
          const { email } = parseMessage.data;
          if (!userController.checkValidLoginByEmail(email)) {
            loginFail("You are already login ");
            return;
          }
          const data = await newAuthClass.login(parseMessage.data);
          const userObj = {
            userId: uuid.v4(),
            v4Id: uuid.v4(),
            ws,
            email: data.email,
          };
          userController.addNewUser(ws, userObj.userId, userObj);
          roomController.createRoom(userObj, ws);
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "register": {
        try {
          await newAuthClass.signUp(parseMessage.data);
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "play": {
        try {
          const { position } = parseMessage.data;
          const { userId } = userController.getUserByWs(ws);
          await roomController.playChess(ws, position, userId);
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "voteRestart": {
        try {
          const { userId } = userController.getUserByWs(ws);
          await roomController.voteRestart(ws, userId);
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "chat": {
        try {
          const { message } = parseMessage.data;
          const { userId } = userController.getUserByWs(ws);
          await roomController.chatRoom(ws, message, userId);
        } catch (err) {
          console.log(err);
        }
      }
    }
  });
  ws.on("error", console.error);

  ws.on("close", function () {
    // Remove
    const userObj = userController.getUserByWs(ws);
    if (userObj) {
      roomController.leaveRoom(ws, userObj);
      userController.removeUser(ws);
    }
  });
});

server.listen(8080, function () {
  console.log("Listening on http://localhost:8080");
});
