/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
const userModel = require("../models/UserModel");
class AuthController {
  constructor(ws, sqlConfig, sql, bcryptjs) {
    this._ws = ws;
    this._sqlConfig = sqlConfig;
    this._sql = sql;
    this._bcryptjs = bcryptjs;
  }
  async login(data) {
    try {
      const userModelForLogin = new userModel("", data.email, "", data.password, "");
      const query = `EXEC LoginWithEmailAndPassword @Email = '${userModelForLogin._email}'`;
      const result = await (
        await this._sql.connect(this._sqlConfig)
      ).query(query);
      if (result.recordset.length === 0)
        return this._ws.send(
          JSON.stringify({ result: "OK", message: "Email or password wrong" })
        );
      const user = result.recordset[0];
      const isMatch = await this._bcryptjs.compare(
        userModelForLogin._password,
        user.password
      );
      if (!isMatch)
        return this._ws.send(JSON.stringify({ result: "OK", message: "Email or password wrong" }));
      // const user = { id, email };
      this._ws.send(JSON.stringify({ result: "OK", message: "Login Success" }));
      return user;
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }
  async signUp(data) {
    try {
      const userModelForSignUp = new userModel(
        data.name,
        data.email,
        data.age,
        data.password,
        ""
      );
      
      const findUserByEmail = `EXEC findUserByEmail @Email = '${userModelForSignUp._email}'`;
      const resultFindUserByEmail = await (
        await this._sql.connect(this._sqlConfig)
      ).query(findUserByEmail);
      if (resultFindUserByEmail.recordset.length > 0)
        return this._ws.send(
          JSON.stringify({ result: "OK", message: "Email already exist" })
        );
      const salt = await this._bcryptjs.genSalt(10);
      const hashedPassword = await this._bcryptjs.hash(
        userModelForSignUp._password,
        salt
      );
      // excute procedure
      const query = `EXEC createUser1 @name = '${userModelForSignUp._name}', @age = ${userModelForSignUp._age}, @email = '${userModelForSignUp._email}' , @Password = '${hashedPassword}' `;
      const result = await (
        await this._sql.connect(this._sqlConfig)
      ).query(query);
      return this._ws.send(
        JSON.stringify({ result: "OK", message: "sign up success" })
      );
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }
}
module.exports = AuthController;
