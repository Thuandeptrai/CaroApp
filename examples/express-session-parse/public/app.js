/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier

var selections = new Array();
selections["X"] = new Array();
selections["Y"] = new Array();
let userDefault = "X";
let createArrayCaro5x5 = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];
let canPlay = true;

(function () {
  const messages = document.querySelector("#messages");
  const wsButton = document.querySelector("#wsButton");
  const wsSendButton = document.querySelector("#wsSendButton");
  const logout = document.querySelector("#logout");
  const login = document.querySelector("#login");
  const getInfoDiv = document.querySelector("#MessageInfo");

  function showMessage(message) {
    messages.textContent += `\n${message}`;
    messages.scrollTop = messages.scrollHeight;
  }

  function handleResponse(response) {
    return response.ok
      ? response.json().then((data) => JSON.stringify(data, null, 2))
      : Promise.reject(new Error("Unexpected response"));
  }

  login.onclick = function () {
    fetch("/login", { method: "POST", credentials: "same-origin" })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  logout.onclick = function () {
    fetch("/logout", { method: "DELETE", credentials: "same-origin" })
      .then(handleResponse)
      .then(showMessage)
      .catch(function (err) {
        showMessage(err.message);
      });
  };

  let ws;

  wsButton.onclick = function () {
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null;
      ws.close();
    }

    const getRoomId = document.querySelector("#roomId");

    ws = new WebSocket(`ws://localhost:8080/${getRoomId.value}`);
    ws.onerror = function () {
      showMessage("WebSocket error");
    };

    ws.onmessage = function (event) {
      console.log("event", event);
      const parseData = JSON.parse(event.data);
      if (parseData.type === "X") {
        userDefault = "X";
        generateGame();
      } else if (parseData.type === "Y") {
        userDefault = "Y";
        canPlay = false;
        generateGame();
      }
      if (parseData.type === "z") {
        return;
      }
      if (parseData.status === "ready") {
        if(parseData.type !== "Y")
        {
          canPlay = true;
        }
      } else if (parseData.status === "waiting") {
          canPlay = false;
        getInfoDiv.innerHTML = "Please Wait";

      }
      const gridSelect = document.querySelectorAll(".grid-box");
      console.log("gridSelect", gridSelect);
      gridSelect.forEach((grid) => {
        grid.addEventListener("click", function () {
          console.log("grid", grid);
          if (canPlay === true) {
            const className = grid.name;
            const row = className.split("-")[1];
            const col = className.split("-")[2];
            // Update arrayBase on obj name (grid-1-1)
            // Update arrayCaro 5x5 with value
            console.log("createArrayCaro5x5", createArrayCaro5x5);
            createArrayCaro5x5[row - 1][col - 1] = userDefault;
            console.log("createArrayCaro5x51", createArrayCaro5x5);

            ws.send(
              JSON.stringify({ type: "board", data: createArrayCaro5x5 })
            );
           getInfoDiv.innerHTML = "Please Wait";

            canPlay = false;
          }
        });
      });
      if (parseData.type === "board") {
        console.log("parseData", parseData);

        updateTable(parseData.data);
        if (parseData.yourTurn) {
          canPlay = true;
          getInfoDiv.innerHTML = "Your Turn";
        }
        console.log("parseData.data", checkWin());
        if(checkWin() === true){
          getInfoDiv.innerHTML = "You Win";
          ws.send(JSON.stringify({
            type: "result",
            data: "You Win",
          }))
        }
      }

      showMessage(event.data);
    };
    ws.onopen = function () {
      showMessage("WebSocket connection established");
    };
    ws.onclose = function () {
      showMessage("WebSocket connection closed");
      ws = null;
    };
  };

  wsSendButton.onclick = function () {
    if (!ws) {
      showMessage("No WebSocket connection");
      return;
    }
    const message = document.querySelector("#wsMessage");
    ws.send(JSON.stringify({ type: "message", messageData: message.value }));
  };
})();
function resetParams() {
  turn = "X";
  game_type = 3;
  total_turns = 0;
  robot = true;
  finished = false;

  selections["X"] = new Array();
  selections["Y"] = new Array();
}
function changeTurn() {
  if (turn == "X") turn = "Y";
  else turn = "X";
}
// update Table via arrayCaro 5x5
function updateTable(data) {
  const getElementByName = document.querySelectorAll(".grid-box");
  createArrayCaro5x5 = data;

  getElementByName.forEach((element) => {
    const className = element.name;
    const row = className.split("-")[1];
    const col = className.split("-")[2];
    if (data[row - 1][col - 1] === "X") {
      element.classList.add("green-player");
    } else if (data[row - 1][col - 1] === "Y") {
      element.classList.add("red-player");
    }
  });
}
function markCheck(obj) {
  // if auto player selected
}
//
function generateGame() {
  // Reseting all initialized params as user selected new game
  resetParams();

  // Getting Variables to update global param
  // game_type = Number(document.getElementById('game_type').value);

  // is auto player selected
  // robot_object = document.getElementById('robot');
  // if (robot_object.checked === true) robot = true;
  // else robot = false;

  // Clearing board for new game
  document.getElementById("game-board").innerHTML = "";

  // Generating board
  for (let row = 1; row <= 5; row++) {
    for (let col = 1; col <= 5; col++) {
      const unique_name = "grid-" + row + "-" + col;
      const unique_id = row + "" + col;
      const button = document.createElement("input");

      button.setAttribute("value", " ");
      button.setAttribute("id", "girdId");
      button.setAttribute("name", unique_name);
      button.setAttribute("class", "grid-box");
      button.setAttribute("type", "button");
      button.setAttribute("onclick", "markCheck(this)");
      document.getElementById("game-board").appendChild(button);
    }

    const breakline = document.createElement("br");
    document.getElementById("game-board").appendChild(breakline);
  }
}
// Wire a function checkWin() in Gomoku game base on value in createArrayCaro5x5
function checkWin() {
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
