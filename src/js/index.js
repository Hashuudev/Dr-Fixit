"use strict";

// if ((window.location.href = "/")) {
//   window.location.href = "signinorup.html";
// }

const userData = JSON.parse(localStorage.getItem("userData"));
console.log(userData);

if (!userData?.accessToken) {
  window.location.href = "signinorup.html";
}
