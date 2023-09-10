"use strict";

import isEmail from "validator/es/lib/isEmail";
import supabase from "./supabaseConfig";

// Supabase Setup

document.addEventListener("DOMContentLoaded", function () {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (userData?.accessToken) {
    window.location.href = "/";
  }
  signUp();
  signIn();
});

// Form-Handling ( Sign Up )
function signUp() {
  const nameError = document.querySelector("#name-error");
  const emailError = document.querySelector("#email-error");
  const passwordError = document.querySelector("#password-error");
  const signUpButton = document.querySelector("#signup");

  signUpButton.addEventListener("click", async function (event) {
    event.preventDefault();
    console.log("1");
    try {
      // Form Validation
      const name = document.getElementById("form-name").value;
      const email = document.getElementById("form-email").value;
      const password = document.getElementById("form-password").value;

      if (name.length <= 4 || !isEmail(email) || password.length < 8) {
        if (name.length <= 4) {
          nameError.textContent = "Name should be greater than 4 characters";
          nameError.style.display = "block";
        }

        if (!isEmail(email)) {
          emailError.textContent = "Email is not valid";
          emailError.style.display = "block";
        }

        if (password.length < 8) {
          passwordError.textContent =
            "Password should be greater than 8 characters";
          passwordError.style.display = "block";
        }
      } else {
        console.log("123");
        signUpButton.textContent = "Signing up";
        let { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        const { err } = await supabase
          .from("profiles")
          .insert([{ id: data.user.id, name: name, email: email }])
          .select();

        document.getElementById("form-name").value = "";
        document.getElementById("form-email").value = "";
        document.getElementById("form-password").value = "";
        signUpButton.textContent = "Sign in";
        document.getElementById("slide-right-button").click();

        console.log(data);
      }

      // Sign Up Authentication

      // You can do further processing or send the data to a server here
    } catch (error) {
      console.error("An error occurred:", error);
    }
  });
}

// Form Handling SignIn
function signIn() {
  // Sign in Authentication
  const signInEmailError = document.querySelector("#signinEmail-error");
  const signInPasswordError = document.querySelector("#signinPass-error");

  const signInButton = document.getElementById("signin");

  signInButton.addEventListener("click", async function (event) {
    event.preventDefault();

    try {
      const email = document.getElementById("signInEmail").value;
      const password = document.getElementById("signInPassword").value;

      // Simulate an async check against your authentication system
      console.log(email.length);
      if (!email) {
        console.log("22");
        signInEmailError.textContent = "Email is required";
        signInEmailError.style.display = "block";
      }
      if (!password) {
        signInPasswordError.textContent = "Password is required";
        signInPasswordError.style.display = "block";
      }
      if (email && password) {
        signInEmailError.style.display = "none";
        signInPasswordError.style.display = "none";

        let { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        console.log(data);

        if (error) {
          signInPasswordError.textContent = error.message;
          signInPasswordError.style.display = "block";
          signInPasswordError.style.textAlign = "center";
          console.log(error.message);
        } else {
          const userData = {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            userId: data.user.id,
            userEmail: data.user.email,
          };
          localStorage.setItem("userData", JSON.stringify(userData));
          window.location.href = "index.html";
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
      // Display the error message to the user or handle it appropriately
    }
  });
}
