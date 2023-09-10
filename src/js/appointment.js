"use strict";

import supabase from "./supabaseConfig";

const name = document.querySelector("#patientsName");
const age = document.querySelector("#patientAge");
const phone = document.querySelector("#patientPhone");
const appointment = document.querySelector("#appointmentTime");
const patients = document.querySelector("#totalPatients");
const payNow = document.querySelector(".pay-now");

const nameError = document.getElementById("val-name");
const ageError = document.getElementById("val-age");
const phoneError = document.getElementById("val-phone");
const appointmentError = document.getElementById("val-appointment");
const patientsError = document.getElementById("val-patients");

const cardContent = document.querySelector(".card");
const doctorId = new URL(window.location.href).searchParams.get("id");

document.addEventListener("DOMContentLoaded", async function () {
  let { data: doctors, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", doctorId);

  if (error) {
    window.location.href = "/service.html";
  }

  console.log(doctors[0], error);

  const doctorDetails = `<div class="card-header">
  <h2>Doctor Details</h2>
</div>
<div class="card-content">
  <div class="field">
    <span class="field-name">Doctor Name: </span>
    <span class="field-type">${doctors[0].doctorName}</span>
  </div>
  <div class="field">
    <span class="field-name">Phone: </span>
    <span class="field-type">${doctors[0].phone}</span>
    
  </div>
  <div class="field">
    <span class="field-name">Specialist: </span>
    <span class="field-type">${doctors[0].expertise}</span>
  </div>
  <div class="field">
    <span class="field-name">Location: </span>
    <span class="field-type">${doctors[0].location}</span>
  </div>
  <div class="field">
    <span class="field-name">Package: </span>
    <span class="field-type">${doctors[0].package}</span>
  </div>
  <div class="field">
    <span class="field-name">Start Time: </span>
    <span class="field-type">${doctors[0].startTime}</span>
  </div>
  <div class="field">
    <span class="field-name">End Time: </span>
    <span class="field-type">${doctors[0].endTime}</span>
  </div>
  <div class="field">
    <span class="field-name">Holiday: </span>
    <span class="field-type">${doctors[0].holiday}</span>
  </div>
</div>`;

  cardContent.insertAdjacentHTML("afterbegin", doctorDetails);
});

payNow.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    name.value &&
    age.value &&
    phone.value &&
    appointment.value &&
    patients.value
  ) {
    console.log(1);
    const appointmentsData = {
      patientsName: name.value,
      patientAge: age.value,
      patientPhone: phone.value,
      time: appointment.value,
      totalPatients: patients.value,
    };

    sessionStorage.setItem(
      "appointmentsData",
      JSON.stringify(appointmentsData)
    );

    window.location.href = `/checkout.html?id=${doctorId}&patients=${patients.value}`;
  }

  if (!name.value) {
    nameError.textContent = "Name is required";
    nameError.style.display = "block";
  }
  if (!age.value) {
    ageError.textContent = "Age is required";
    ageError.style.display = "block";
  }
  if (!phone.value) {
    phoneError.textContent = "Phone is required";
    phoneError.style.display = "block";
  }
  if (!appointment.value) {
    appointmentError.textContent = "Date is required";
    appointmentError.style.display = "block";
  }
  if (!patients.value) {
    patientsError.textContent = "Number of patients is required";
    patientsError.style.display = "block";
  }
});
