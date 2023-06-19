/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
const uuid = require("uuid");
const {
  sendNotifyForLogin,
  notifyWithData,
} = require("../handler/SendNotifyForResponse");
const checkValidTable = require("../handler/CheckValidTable");
const checkWin = require("../helper/CheckWin");
const { wsWithStatusAndData } = require("../utils/SendResponse");
const { DEFAULT_TABLE } = require("../config/CONFIG");
const defaultRoom = require("../utils/RoomDefault");
const RoomModel = require("../models/RoomModel");
// store _allRoom In map
class RoomController {
  constructor() {
    this._allRoom = new Map();
    this._wsContain = new Map();
    this._roomFree = [];
  }
  async createRoom(userObj, ws) {
    const keysArray = [...this._allRoom.keys()];
    const lastKey = keysArray[keysArray.length - 1];
    if (this._allRoom.size === 0) {
      const mapKey = uuid.v4();
      this._allRoom.set(mapKey, RoomModel);
      this._wsContain.set(ws, mapKey);
      ws.send(sendNotifyForLogin(this._allRoom.get(mapKey), userObj));
    } else if (this._allRoom.get(lastKey)?.roomMember?.length == 2) {
      const mapKey = uuid.v4();
      this._allRoom.set(mapKey, defaultRoom(userObj, ws));
      this._wsContain.set(ws, mapKey);
    } else {
      let position = lastKey;
      if (this._roomFree.length > 0) {
        position = this._roomFree[0];
        this._roomFree.shift();
      }
      const getRoomObj = this._allRoom.get(position);
      const finalObj = {
        ...getRoomObj,
        roomMember: [...getRoomObj.roomMember, userObj.userId],
        roomSocket: [...getRoomObj.roomSocket, ws],
        status: "playing",
      };
      this._allRoom.set(position, finalObj);
      ws.send(sendNotifyForLogin(this._allRoom.get(lastKey), userObj));
      this._wsContain.set(ws, position);
      this._allRoom.get(lastKey).roomSocket.forEach((socket) => {
        socket.send(wsWithStatusAndData("status", "playing"));
      });
    }
  }
  async leaveRoom(ws) {
    const roomKey = this._wsContain.get(ws);
    const room = this._allRoom.get(roomKey);
    const position = room.roomSocket.indexOf(ws);
    room.roomSocket.splice(position, 1);
    room.roomMember.splice(position, 1);
    if (room.roomMember.length === 0) {
      this._allRoom.delete(roomKey);
      this._roomFree.slice(this._roomFree.indexOf(roomKey), 1);
    } else {
      this._allRoom.set(roomKey, room);
      this._roomFree.push(roomKey);
    }
  }
  async playChess(ws, position, userId) {
    const roomKey = this._wsContain.get(ws);
    const room = this._allRoom.get(roomKey);

    if (
      !room ||
      room.status === "waiting" ||
      room.turn !== userId ||
      room.status === "end"
    ) {
      ws.send(
        wsWithStatusAndData("notify", {
          message: "You can't play now",
        })
      );
      return;
    }
    const { defaultTable } = room;
    if (!checkValidTable(ws, defaultTable, position)) {
      return;
    }
    defaultTable[position.x][position.y] = userId;
    const finalObj = {
      ...room,
      defaultTable,
      turn: room.turn === room.userX ? room.roomMember[1] : room.userX,
    };
    if (checkWin(defaultTable, userId)) {
      finalObj.status = "end";
      finalObj.voteRestart = [];
      finalObj.turn = finalObj.userX;
      finalObj.winner = userId;
      room.roomSocket.forEach((socket) => {
        socket.send(
          wsWithStatusAndData("end", {
            winner: userId,
          })
        );
      });
    } else {
      room.roomSocket.forEach((socket) => {
        socket.send(
          wsWithStatusAndData("play", {
            defaultTable,
            turn: finalObj.turn,
          })
        );
      });
    }

    this._allRoom.set(roomKey, finalObj);
  }
  async voteRestart(ws, userId) {
    const roomKey = this._wsContain.get(ws);
    const room = this._allRoom.get(roomKey);
    if (!room || room.status === "waiting" || room.status === "end") {
      ws.send(
        wsWithStatusAndData("notify", {
          message: "You can't vote now",
        })
      );
      return;
    }
    const { voteRestart } = room;
    if (voteRestart.includes(userId)) {
      ws.send(
        wsWithStatusAndData("notify", {
          message: "You voted",
        })
      );
      return;
    } else {
      voteRestart.push(userId);
      const finalObj = {
        ...room,
        voteRestart,
      };
      if (voteRestart.length === 2) {
        finalObj.defaultTable = defaultRoom().defaultTable;
        finalObj.status = "playing";
        finalObj.turn = finalObj.userX;
        finalObj.winner = null;
        finalObj.voteRestart = [];
        finalObj.roomSocket.forEach((socket) => {
          socket.send(
            wsWithStatusAndData("restart", {
              defaultTable: finalObj.defaultTable,
              turn: finalObj.turn,
            })
          );
        });
      } else {
        finalObj.roomSocket.forEach((socket) => {
          socket.send(
            wsWithStatusAndData("vote", {
              message: "You voted",
            })
          );
        });
      }
    }
  }
  async chatRoom(ws, message, userId) {
    const roomKey = this._wsContain.get(ws);
    const room = this._allRoom.get(roomKey);
    if (!room || room.status === "waiting" || room.status === "end") {
      ws.send(
        wsWithStatusAndData("notify", {
          message: "You can't chat now",
        })
      );
      return;
    }
    const finalObj = {
      ...room,
      chat: [...room.chat, { message, userId }],
    };
    finalObj.roomSocket.forEach((socket) => {
      socket.send(
        wsWithStatusAndData("chat", {
          message,
          userId,
        })
      );
    });
    this._allRoom.set(roomKey, finalObj);
  }
  async getUserByRoom(ws) {
    if (this._wsContain.has(ws)) {
      const roomKey = this._wsContain.get(ws);
      const room = this._allRoom.get(roomKey);
      ws.send({
        status: "room",
        data: room,
      });
    }
  }
}
module.exports = new RoomController();
