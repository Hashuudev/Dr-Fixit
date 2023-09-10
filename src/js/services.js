"use strict";

import supabase from "./supabaseConfig";
document.addEventListener("DOMContentLoaded", async function () {
  let { data: doctors, error } = await supabase.from("doctors").select("*");

  const boxesSection = document.querySelector(".boxes");
  if (doctors) {
    const loaderContainer = document.querySelector(".loader-container");
    loaderContainer.style.display = "none";

    doctors.forEach((doctor) => {
      const card = `
      <div class="card">
              <div class="card-image">
                  <img src="${doctor.image}" alt="Profile image">
              </div>
              <p class="name">${doctor.doctorName}</p>
              <p>${doctor.expertise}</p>
              <div class="socials" id="appointmentContainer">
                  <a class="Appointment-button" id="appointmentBtn">
                  Appointment
                  </a>
                  <input type="hidden" id="doctor-id" value = ${doctor.id} />
              </div>
          </div>`;

      boxesSection.insertAdjacentHTML("afterbegin", card);
    });
  }

  boxesSection.addEventListener("click", function (e) {
    if (e.target.id == "appointmentBtn") {
      const doctorId = e.target.nextElementSibling.value;
      window.location.href = `appointments.html/?id=${doctorId}`;
    }
  });
});
