/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier

const { DEFAULT_TABLE } = require("../config/CONFIG");


class RoomModel {
  constructor() {
    this._roomOwner= "",
    this._roomMember= [],
    this._userX= "",
    this._turn= "",
    this._defaultTable= DEFAULT_TABLE,
    this._voteRestart= [],
    this._status=  "waiting"
  }
}
module.exports = new RoomModel();
