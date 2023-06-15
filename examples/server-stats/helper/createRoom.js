/* eslint-disable quotes */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
const uuid = require("uuid");

function createRoom(allRoom, userObj) {
  if (allRoom.length === 0) {
    allRoom.push({
      roomName: uuid.v4(),
      roomOwner: userObj.userId,
      roomMember: [userObj.userId],
      userX: userObj.userId,
      defaultTable: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      status: "waiting",
    });
  } else if (allRoom[allRoom.length - 1]?.roomMember?.length === 2) {
    allRoom.push({
      roomName: uuid.v4(),
      roomOwner: userObj.userId,
      roomMember: [userObj.userId],
      userX: userObj.userId,
      defaultTable: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      status: "waiting",
    });
  } else {
    allRoom[allRoom.length - 1].roomMember.push(userObj.userId);
    allRoom[allRoom.length - 1].userO = userObj.userId;
    allRoom[allRoom.length - 1].status = "playing";
    allRoom[allRoom.length - 1].turn = allRoom[allRoom.length - 1].userX;
  }
  return allRoom;
}
module.exports = createRoom;
