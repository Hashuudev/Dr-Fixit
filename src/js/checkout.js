// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
import supabase from "./supabaseConfig";
import nodemailer from "nodemailer";

const stripe = Stripe(
  "pk_test_51NCDBnFLDQjuRWyykCuo2Wn8tLWV3kzxeyCGPogtLl2B7kQg0cgVsWTdaLAT4jS1YjoElqZJ4W3UspmR4T66vHSD00quQmuI7a"
);

const calculating = document.getElementById("calculating");
const payNowBtn = document.getElementById("button-text");
const counterTag = document.getElementById("counterTag");
const paymentBtn = document.querySelector(".paymentBtn");
// The items the customer wants to buy
let totalPackage;
const doctorId = new URL(window.location.href).searchParams.get("id");
const patientsId = new URL(window.location.href).searchParams.get("patients");

let elements;
let clientSecret;
let doctorEmail;
document.addEventListener("DOMContentLoaded", async function () {
  let { data: doctors, error } = await supabase
    .from("doctors")
    .select("package,id,doctorsEmail")
    .eq("id", doctorId);
  if (error) {
  } else {
    const items = {
      id: doctors[0].id,
      package: doctors[0].package,
      numPatients: patientsId,
    };
    doctorEmail = doctors[0].doctorsEmail;
    // totalPackage = doctors[0].package * patientsId;
    await initialize(items);
    await checkStatus();
  }
  console.log(doctors);
});

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

let emailAddress = "";

// Fetches a payment intent and captures the client secret
async function initialize(items) {
  const response = await fetch(
    "https://red-light-scorpion.cyclic.app/create-payment-intent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }
  );
  const { clientSecret, totalAmount } = await response.json();
  totalPackage = totalAmount;
  const appearance = {
    theme: "stripe",
  };
  elements = stripe.elements({ appearance, clientSecret });
  clientSecret = clientSecret;

  payNowBtn.textContent = `Pay: ${totalPackage} PKR`;

  calculating.style.display = "none";
  paymentBtn.style.display = "block";
  const linkAuthenticationElement = elements.create("linkAuthentication");
  linkAuthenticationElement.mount("#link-authentication-element");

  linkAuthenticationElement.on("change", (event) => {
    emailAddress = event.value.email;
  });

  const paymentElementOptions = {
    layout: "tabs",
  };

  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      // Make sure to change this to your payment completion page
      return_url: "http://localhost:1234/service.html",
      receipt_email: emailAddress,
    },
    redirect: "if_required",
  });

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      const appointmentsData = sessionStorage.getItem("appointmentsData");
      const { userId, userEmail } = JSON.parse(
        localStorage.getItem("userData")
      );
      const bookingdata = JSON.parse(appointmentsData);
      bookingdata.totalPrice = totalPackage;
      bookingdata.userId = userId;
      bookingdata.doctorId = doctorId;

      console.log(bookingdata);

      payNowBtn.textContent = `Payment Succeeded`;
      paymentBtn.style.backgroundColor = "green";
      let seconds = 5;
      counterTag.textContent = `You will be redirected in ${seconds}`;
      const counter = setInterval(() => {
        seconds = seconds - 1;
        counterTag.textContent = `You will be redirected in ${seconds}`;
        if (seconds == 0) {
          clearInterval(counter);
        }
      }, 1000);
      setTimeout(() => {
        window.location.href = "/service.html";
      }, 5000);

      const { data, error } = await supabase
        .from("appointments")
        .insert([bookingdata]).select(`
      *,
      doctors (
      *
      ),
      profiles (
        *
        )
      `);
      if (!error) {
        const res = await fetch(
          "https://red-light-scorpion.cyclic.app/send_appointment_mail",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ doctorEmail, userEmail, data }),
          }
        );
      }

      console.log(data);
      console.log(error);

    // send mail with defined transport object

    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }

  // if (paymentIntent.status == "succeeded") {
  //   const appointmentsData = sessionStorage.getItem("appointmentsData");

  //   console.log(JSON.parse(appointmentsData));
  //   payNowBtn.textContent = `Payment Succeeded`;
  //   paymentBtn.style.backgroundColor = "green";
  //   let seconds = 5;
  //   counterTag.textContent = `You will be redirected in ${seconds}`;
  //   setInterval(() => {
  //     seconds = seconds - 1;
  //     counterTag.textContent = `You will be redirected in ${seconds}`;
  //   }, 1000);
  //   setTimeout(() => {
  //     window.location.href = "/service.html";
  //   }, 5000);
  // }

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (error) {
    if (error?.type === "card_error" || error?.type === "validation_error") {
      showMessage(error.message);
    } else {
      showMessage("An unexpected error occurred.");
    }
  }
  setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  // const clientSecret = new URLSearchParams(window.location.search).get(
  //   "payment_intent_client_secret"
  // );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}

// async..await is not allowed in global scope, must use a wrapper
