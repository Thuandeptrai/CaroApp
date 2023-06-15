/* eslint-disable quotes */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
function checkWin(createArrayCaro5x5,userDefault) {
  // Check rows
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      if (
        createArrayCaro5x5[row][col] === userDefault &&
        createArrayCaro5x5[row][col + 1] === userDefault &&
        createArrayCaro5x5[row][col + 2] === userDefault &&
        createArrayCaro5x5[row][col + 3] === userDefault &&
        createArrayCaro5x5[row][col + 4] === userDefault
      ) {
        return true;
      }
    }
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 2; row++) {
      if (
        createArrayCaro5x5[row][col] === userDefault &&
        createArrayCaro5x5[row + 1][col] === userDefault &&
        createArrayCaro5x5[row + 2][col] === userDefault &&
        createArrayCaro5x5[row + 3][col] === userDefault &&
        createArrayCaro5x5[row + 4][col] === userDefault
      ) {
        return true;
      }
    }
  }

  // Check diagonals
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      if (
        createArrayCaro5x5[row][col] === userDefault &&
        createArrayCaro5x5[row + 1][col + 1] === userDefault &&
        createArrayCaro5x5[row + 2][col + 2] === userDefault &&
        createArrayCaro5x5[row + 3][col + 3] === userDefault &&
        createArrayCaro5x5[row + 4][col + 4] === userDefault
      ) {
        return true;
      }
    }
  }

  for (let row = 4; row > 2; row--) {
    for (let col = 0; col < 2; col++) {
      if (
        createArrayCaro5x5[row][col] === userDefault &&
        createArrayCaro5x5[row - 1][col + 1] === userDefault &&
        createArrayCaro5x5[row - 2][col + 2] === userDefault &&
        createArrayCaro5x5[row - 3][col + 3] === userDefault &&
        createArrayCaro5x5[row - 4][col + 4] === userDefault
      ) {
        return true;
      }
    }
  }

  return false;
}
module.exports = checkWin;