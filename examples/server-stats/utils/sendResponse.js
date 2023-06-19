/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
function wsWithStatusAndData(status, data) {
  return JSON.stringify({
    type: status,
    data: data,
  });
}
module.exports ={
    wsWithStatusAndData
}