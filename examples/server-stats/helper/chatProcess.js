/* eslint-disable quotes */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
function chatProcess(ws, allClient, room, user, roomName, message) {
  if (!room || !user) {
    return ws.send(
      JSON.stringify({
        type: "notify",
        data: "Room or user not found",
      })
    );
  }
  room.roomMember.forEach((member) => {
    const user = allClient.find((user) => user.userId === member);
    user.ws.send(
      JSON.stringify({
        type: "chat",
        data: {
          roomName,
          message,
        },
      })
    );
  });
}
module.exports = chatProcess;