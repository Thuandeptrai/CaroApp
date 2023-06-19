/* eslint-disable quotes */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
const { notifyWithData } = require("./SendNotifyForResponse");

function checkValidTable(ws, defaultTable, position) {
  if (position.x > 4 || position.y > 4) {
    ws.send(notifyWithData("Invalid move"));
    return false;
  }
  if (defaultTable[position.x][position.y] !== 0) {
    ws.send(notifyWithData("Invalid move"));
    return false;
  }
  
  return true;
}
module.exports = checkValidTable;
