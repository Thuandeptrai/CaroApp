/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
const uuid = require("uuid");
const { DEFAULT_TABLE } = require("../config/CONFIG");

const defaultRoom = (userObj, ws) => {
  return {
    roomOwner: userObj.userId,
    roomMember: [userObj.userId],
    userX: userObj.userId,
    turn: userObj.userId,
    defaultTable: DEFAULT_TABLE,
    voteRestart: [],
    status: "waiting",
  };
};

module.exports = defaultRoom;
