/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
function updateSend(room) {
  return JSON.stringify({
    type: "update",
    data: room.defaultTable,
    status: room.status,
    winner: room.winner,
    turn: room.turn,
  });
}
module.exports = updateSend;
