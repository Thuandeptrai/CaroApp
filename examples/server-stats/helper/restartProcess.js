/* eslint-disable quotes */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
function restartProcess(user, room, roomName, allClient) {
  if (room.status === "playing" || room.status === "end") {
    if (room.voteRestart) {
      room.voteRestart.push(user.userId);
    } else {
      room.voteRestart = [user.userId];
    }
  }
  if (room.voteRestart.length === 2) {
    room.defaultTable = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];
    room.status = "playing";
    room.turn = room.userX;
    room.winner = null;
    room.voteRestart = [];
    allClient.forEach((user) => {
      user.ws.send(
        JSON.stringify({
          type: "update",
          data: {
            roomName,
            room,
          },
        })
      );
    });
  }
}
exports.default = restartProcess;
