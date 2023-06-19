/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
class UserController {
  constructor() {
    this._wsMap = new Map();
    this._userIdMap = new Map();
  }
  addNewUser(ws, userObj) {
    this._wsMap.set(ws, userObj);
    this._userIdMap.set(userObj.email, {
      ...userObj,
      ws,
    });
  }
  getUserByWs(ws) {
    return this._wsMap.get(ws);
  }
  checkValidLoginByEmail(email) {
    const user = this._userIdMap.get(email);
    if (user) {
      return false;
    }
    return true;
  }
  removeUser(ws) {
    const userObj = this._wsMap.get(ws);
    this._wsMap.delete(ws);
    this._userIdMap.delete(userObj.email);
  }

}
module.exports = new UserController();
