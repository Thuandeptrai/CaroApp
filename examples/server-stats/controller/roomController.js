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
const checkValidTable = require("../handler/SheckValidTable");
const checkWin = require("../helper/CheckWin");
const { wsWithStatusAndData } = require("../utils/SendResponse");
// store _allRoom In map
class RoomController {
  constructor() {
    this._allRoom = new Map();
    this._wsContain = new Map();
  }
  async createRoom(userObj, ws) {
    if (this._allRoom.size === 0) {
      this._allRoom.set(this._allRoom.size, {
        roomName: uuid.v4(),
        roomOwner: userObj.userId,
        roomMember: [userObj.userId],
        roomSocket: [ws],
        userX: userObj.userId,
        turn: userObj.userId,
        defaultTable: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
        voteRestart: [],
        status: "waiting",
      });
      this._wsContain.set(ws, this._allRoom.size - 1);
      ws.send(sendNotifyForLogin(this._allRoom.get(0), userObj));
    } else if (
      this._allRoom.get(this._allRoom.size - 1).roomMember.length == 2
    ) {
      this._allRoom.set(this._allRoom.size, {
        roomName: uuid.v4(),
        roomOwner: userObj.userId,
        roomMember: [userObj.userId],
        roomSocket: [ws],
        userX: userObj.userId,
        turn: userObj.userId,
        defaultTable: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
        voteRestart: [],
        status: "waiting",
      });
      this._wsContain.set(ws, this._allRoom.size);
    } else {
      const getRoomObj = this._allRoom.get(this._allRoom.size - 1);
      const finalObj = {
        ...getRoomObj,
        roomMember: [...getRoomObj.roomMember, userObj.userId],
        roomSocket: [...getRoomObj.roomSocket, ws],
        status: "playing",
      };
      this._allRoom.set(this._allRoom.size - 1, finalObj);
      ws.send(
        sendNotifyForLogin(this._allRoom.get(this._allRoom.size - 1), userObj)
      );
      this._wsContain.set(ws, this._allRoom.size - 1);
      this._allRoom.get(this._allRoom.size - 1).roomSocket.forEach((socket) => {
        socket.send(wsWithStatusAndData("status", "playing"));
      });
    }
  }
  async playChess(ws, position, userId) {
    const roomKey = this._wsContain.get(ws);
    const room = this._allRoom.get(roomKey);
    if (!room || room.status === "waiting" || room.turn !== userId || room.status === "end") {
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
  async restartGame(ws, userId) {
    const roomKey = this._wsContain.get(ws);
    const room = this._allRoom.get(roomKey);
    if (!room || room.status === "waiting") {
      ws.send(
        wsWithStatusAndData("notify", {
          message: "You can't restart now",
        })
      );
      return;
    }
    const { voteRestart } = room;
    if (voteRestart.includes(userId)) {
      ws.send(notifyWithData("You have already voted"));
      return;
    } else {
      voteRestart.push(userId);
      const finalObj = {
        ...room,
        voteRestart,
      };
      if (voteRestart.length === room.roomMember.length) {
        finalObj.defaultTable = [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ];
        finalObj.turn = finalObj.userX;
        finalObj.voteRestart = [];
        room.roomSocket.forEach((socket) => {
          socket.send(
            wsWithStatusAndData("restart", {
              voteRestart,
              defaultTable: finalObj.defaultTable,
              turn: finalObj.turn,
            })
          );
        });
      }
      this._allRoom.set(roomKey, finalObj);
      if (voteRestart.length !== 2) {
        room.roomSocket.forEach((socket) => {
          socket.send(
            wsWithStatusAndData("restart", {
              voteRestart,
            })
          );
        });
      }
    }
  }
  async chatRoom(ws, message, userId) {
    const roomKey = this._wsContain.get(ws);
    const room = this._allRoom.get(roomKey);
    const { roomSocket } = room;
    roomSocket.forEach((socket) => {
      socket.send(
        wsWithStatusAndData("chat", {
          message,
          userId,
        })
      );
    });
  }
  async leaveRoom(ws, userId) {
    const roomKey = this._wsContain.get(ws);
    const room = this._allRoom.get(roomKey);
    if (!room) {
      ws.send(notifyWithData("You are not in any room"));
      return;
    }
    const { roomSocket, roomMember, roomOwner } = room;
    const finalObj = {
      ...room,
      roomMember: roomMember.filter((item) => item !== userId),
      roomSocket: roomSocket.filter((item) => item !== ws),
    };
    if (roomMember.length === 1) {
      this._allRoom.delete(roomKey);
      this._wsContain.delete(ws);
    } else {
      if (userId === roomOwner) {
        finalObj.roomOwner = roomMember[0];
      }
      if (roomMember.length === 2) {
        finalObj.status = "waiting";
      }
      this._allRoom.set(roomKey, finalObj);
      this._wsContain.set(ws, roomKey);
    }
    roomSocket.forEach((socket) => {
      socket.send(
        wsWithStatusAndData("leave", {
          userId,
        })
      );
    });
  }
}
module.exports = new RoomController();
