/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier

function signUp() {
  const name = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const age = document.getElementById("age").value;
  const password = document.getElementById("password").value;
  fetch("/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, age, password }),
  })
    .then((res) => {
      alert("Sign up success");
    })
    .catch((err) => console.log(err));
}
