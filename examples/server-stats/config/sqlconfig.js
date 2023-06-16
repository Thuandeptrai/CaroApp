/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
const sqlConfig = {
  user: "ThuanTest1",
  password: "123456",
  database: "CaroApp",
  server: "localhost",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    trustServerCertificate: true,
  },
};
module.exports = sqlConfig;
