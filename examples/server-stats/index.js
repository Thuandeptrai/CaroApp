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
const UserModel = require("./models/UserModel");
const bcryptjs = require("bcryptjs");
const AuthController = require("./controller/AuthController");

const { createServer } = require("http");
const { WebSocketServer } = require("../..");
const RoomController = require("./controller/RoomController");
const {
  loginFail, notifyWithData,
} = require("./handler/SendNotifyForResponse");
const {SQLCONFIG} = require("./config/CONFIG");
const UserController = require("./controller/UserController");
const app = express();
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", function (ws) {
  const newAuthClass = new AuthController(ws, SQLCONFIG, sql, bcryptjs);
  ws.on("message", async function (message) {
    const parseMessage = JSON.parse(message);
    switch (parseMessage.type) {
      case "login": {
        try {
          const { email } = parseMessage.data;
          if (!UserController.checkValidLoginByEmail(email)) {
            notifyWithData("You are already login ");
            return;
          }
          const data = await newAuthClass.login(parseMessage.data);
          const userModel = new UserModel(data.name, data.email, data.age, data.password, ws);
          UserController.addNewUser(ws, userModel);
          RoomController.createRoom(userModel, ws);
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
          const { userId } = UserController.getUserByWs(ws);
          await RoomController.playChess(ws, position, userId);
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "voteRestart": {
        try {
          const { userId } = UserController.getUserByWs(ws);
          await RoomController.voteRestart(ws, userId);
        } catch (err) {
          console.log(err);
        }
        break;
      }
      case "chat": {
        try {
          const { message } = parseMessage.data;
          const { userId } = UserController.getUserByWs(ws);
          await RoomController.chatRoom(ws, message, userId);
        } catch (err) {
          console.log(err);
        }
      }
    }
  });
  ws.on("error", console.error);

  ws.on("close", function () {
    // Remove
    const userObj = UserController.getUserByWs(ws);
    if (userObj) {
      RoomController.leaveRoom(ws, userObj);
      UserController.removeUser(ws);
    }
  });
});

server.listen(8080, function () {
  console.log("Listening on http://localhost:8080");
});
