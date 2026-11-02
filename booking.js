"use strict";

function initDemoBooking() {
  const form = document.querySelector("#booking-form");
  if (!form || !window.MyFisioDemo) return;
  const demo = window.MyFisioDemo;
  const fields = form.querySelector("#booking-fields");
  const service = form.elements.service;
  const date = form.elements.date;
  const slots = document.querySelector("#booking-slots");
  const hint = document.querySelector("#booking-time-hint");
  const error = document.querySelector("#booking-error");
  const success = document.querySelector("#booking-success");
  let store;
  let savedId = null;

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
  }
  function refreshSlots() {
    const selected = form.querySelector('input[name="time"]:checked')?.value;
    slots.replaceChildren();
    date.min = demo.today();
    date.max = demo.addDays(demo.today(), 30);
    const message = demo.dateError(date.value);
    date.setCustomValidity(message);
    if (message) {
      hint.textContent = message;
      return;
    }
    try {
      const hours = store.slots(date.value);
      hint.textContent = hours.some((hour) => hour.available)
        ? "Horarios de ejemplo, en hora de Costa Rica. Cada cita dura 60 minutos."
        : "No quedan horarios para ese día en la demo. Elegí otra fecha.";
      hours.forEach(({ time, available }) => {
        const label = document.createElement("label");
        label.className = "booking-slot";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "time";
        input.value = time;
        input.required = true;
        input.disabled = !available;
        input.checked = available && selected === time;
        const text = document.createElement("span");
        text.textContent = time;
        if (!available) {
          const detail = document.createElement("small");
          detail.textContent = "No disponible";
          text.append(detail);
        }
        label.append(input, text);
        slots.append(label);
      });
    } catch (problem) {
      showError(problem.message);
    }
  }
  function renderSuccess(appointment) {
    document.querySelector("#booking-success-title").textContent = {
      pending: "Cita de demo apartada",
      confirmed: "Cita de demo confirmada",
      cancelled: "Cita de demo cancelada",
    }[appointment.status];
    const summary = document.querySelector("#booking-summary");
    summary.replaceChildren();
    const values = [
      ["Referencia", demo.reference(appointment.id)],
      ["Nombre de demo", appointment.name],
      [
        "Servicio",
        demo.SERVICES.find((s) => s.id === appointment.serviceId).name,
      ],
      [
        "Fecha y hora",
        `${demo.formatDate(appointment.date)}, ${appointment.time}`,
      ],
      ["Estado", `${demo.STATUS_LABELS[appointment.status]} en la demo`],
    ];
    values.forEach(([label, value]) => {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value;
      summary.append(dt, dd);
    });
  }

  try {
    store = demo.createStore(window.localStorage);
    store.list();
    demo.SERVICES.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      service.append(option);
    });
    date.min = demo.today();
    date.max = demo.addDays(demo.today(), 30);
    let initial = date.min;
    for (let day = 0; day <= 30; day++) {
      initial = demo.addDays(date.min, day);
      if (
        !demo.dateError(initial) &&
        store.slots(initial).some((hour) => hour.available)
      )
        break;
    }
    date.value = initial;
    fields.disabled = false;
    refreshSlots();
  } catch (problem) {
    showError(problem.message);
    return;
  }

  date.addEventListener("change", () => {
    error.hidden = true;
    refreshSlots();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.hidden = true;
    const time = form.querySelector('input[name="time"]:checked')?.value;
    if (!time) {
      showError("Elegí un horario disponible para continuar.");
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const appointment = store.create({
        serviceId: service.value,
        date: date.value,
        time,
        name: form.elements.name.value,
      });
      savedId = appointment.id;
      renderSuccess(appointment);
      form.hidden = true;
      success.hidden = false;
      success.querySelector("h3").focus();
      window.dispatchEvent(new Event("myfisio:layout"));
    } catch (problem) {
      refreshSlots();
      showError(problem.message);
    } finally {
      submit.disabled = false;
    }
  });
  document.querySelector("#booking-another").addEventListener("click", () => {
    savedId = null;
    success.hidden = true;
    form.hidden = false;
    form.elements.name.value = "";
    form
      .querySelectorAll('input[name="time"]')
      .forEach((input) => (input.checked = false));
    refreshSlots();
    service.focus();
    window.dispatchEvent(new Event("myfisio:layout"));
  });
  document.querySelectorAll("[data-book-service]").forEach((link) =>
    link.addEventListener("click", () => {
      if (form.hidden) {
        savedId = null;
        success.hidden = true;
        form.hidden = false;
        form.elements.name.value = "";
        form
          .querySelectorAll('input[name="time"]')
          .forEach((input) => (input.checked = false));
      }
      service.value = link.dataset.bookService;
      error.hidden = true;
      refreshSlots();
    }),
  );
  function synchronize() {
    refreshSlots();
    if (savedId) {
      try {
        const appointment = store.list().find((item) => item.id === savedId);
        if (appointment) renderSuccess(appointment);
        else {
          success.hidden = true;
          form.hidden = false;
          savedId = null;
        }
      } catch (problem) {
        showError(problem.message);
      }
    }
  }
  window.addEventListener("storage", (event) => {
    if (event.key === demo.STORAGE_KEY || event.key === null) synchronize();
  });
  window.addEventListener("focus", synchronize);
  window.addEventListener("pageshow", synchronize);
}
initDemoBooking();
