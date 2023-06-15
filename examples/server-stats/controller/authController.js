/* eslint-disable quotes */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */

class authController {
  async login(data, ws, sqlConfig, sql, bcryptjs) {
    try {
      const { email, password } = data;
      const query = `EXEC LoginWithEmailAndPassword @Email = '${email}'`;
      const result = await (await sql.connect(sqlConfig)).query(query);
      if (result.recordset.length === 0)
        return ws.send(JSON.stringify({ result: "OK", message: "Email or password wrong" }));
      const user = result.recordset[0];
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch)
        return ws.send({ result: "OK", message: "Email or password wrong" });
      // const user = { id, email };
       ws.send(JSON.stringify({ result: "OK", message: "Login Success" }));
       return user;
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }
  async signUp(data, ws, sqlConfig, sql, bcryptjs) {
    try{
      console.log("req.body", data);
        const { name, age, email, password } = data;

        const findUserByEmail = `EXEC findUserByEmail @Email = '${email}'`;
        const resultFindUserByEmail = await (
          await sql.connect(sqlConfig)
        ).query(findUserByEmail);
        if (resultFindUserByEmail.recordset.length > 0)
          return ws.send(JSON.stringify({ result: "OK", message: "Email already exist" }));
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        // excute procedure
        const query = `EXEC createUser1 @name = '${name}', @age = ${age}, @email = '${email}' , @Password = '${hashedPassword}' `;
        const result = await (await sql.connect(sqlConfig)).query(query);
        return ws.send(JSON.stringify({ result: "OK", message: "sign up success" }));

    }catch(err){
      console.log(err);
      throw new Error(err);
    }
  }
}
module.exports = new authController();
