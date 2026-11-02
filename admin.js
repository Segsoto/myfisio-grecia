"use strict";

function initDemoAdmin() {
  const demo = window.MyFisioDemo;
  const list = document.querySelector("#admin-list");
  const filter = document.querySelector("#admin-filter");
  const message = document.querySelector("#admin-message");
  const count = document.querySelector("#admin-count");
  let store;
  function announce(text, isError = false) {
    message.textContent = text;
    message.hidden = false;
    message.classList.toggle("is-error", isError);
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function detail(label, value) {
    const group = element("div", "appointment-detail");
    group.append(element("dt", "", label), element("dd", "", value));
    return group;
  }
  function render() {
    try {
      const appointments = store.list();
      const pending = appointments.filter((a) => a.status === "pending").length;
      count.textContent = `${appointments.length} ${appointments.length === 1 ? "cita guardada" : "citas guardadas"} · ${pending} ${pending === 1 ? "apartada" : "apartadas"}`;
      const visible = appointments
        .filter((a) => filter.value === "all" || a.status === filter.value)
        .sort((a, b) =>
          `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
        );
      list.replaceChildren();
      document.querySelector("#admin-empty").hidden = visible.length !== 0;
      visible.forEach((appointment) => {
        const row = element("li", "appointment-row");
        const identity = element("div", "appointment-identity");
        identity.append(
          element("h2", "", appointment.name),
          element(
            "span",
            "appointment-reference",
            demo.reference(appointment.id),
          ),
        );
        const details = element("dl", "appointment-details");
        details.append(
          detail(
            "Servicio",
            demo.SERVICES.find((s) => s.id === appointment.serviceId).name,
          ),
          detail(
            "Fecha y hora",
            `${demo.formatDate(appointment.date)}, ${appointment.time}`,
          ),
        );
        const status = element(
          "span",
          `appointment-status status-${appointment.status}`,
          demo.STATUS_LABELS[appointment.status],
        );
        const actions = element("div", "appointment-actions");
        const choices =
          appointment.status === "cancelled"
            ? [["pending", "Reactivar"]]
            : appointment.status === "pending"
              ? [
                  ["confirmed", "Confirmar"],
                  ["cancelled", "Cancelar"],
                ]
              : [["cancelled", "Cancelar"]];
        choices.forEach(([next, label]) => {
          const button = element(
            "button",
            next === "cancelled" ? "admin-action is-quiet" : "admin-action",
            label,
          );
          button.type = "button";
          button.dataset.id = appointment.id;
          button.dataset.status = next;
          button.setAttribute(
            "aria-label",
            `${label} cita de ${appointment.name}`,
          );
          actions.append(button);
        });
        row.append(identity, details, status, actions);
        list.append(row);
      });
    } catch (problem) {
      announce(problem.message, true);
      count.textContent = "No se pudieron cargar las citas.";
    }
  }
  try {
    store = demo.createStore(window.localStorage);
    render();
  } catch (problem) {
    announce(problem.message, true);
    count.textContent = "Almacenamiento no disponible.";
    return;
  }
  filter.addEventListener("change", () => {
    message.hidden = true;
    render();
  });
  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    try {
      const appointment = store.updateStatus(
        button.dataset.id,
        button.dataset.status,
      );
      render();
      announce(
        `${demo.reference(appointment.id)}: ${demo.STATUS_LABELS[appointment.status].toLowerCase()} en la demo.`,
      );
      const nextButton = [...list.querySelectorAll("button[data-id]")].find(
        (item) => item.dataset.id === appointment.id,
      );
      if (nextButton) nextButton.focus();
      else filter.focus();
    } catch (problem) {
      announce(problem.message, true);
      render();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === demo.STORAGE_KEY || event.key === null) render();
  });
  window.addEventListener("focus", render);
  window.addEventListener("pageshow", render);
}
initDemoAdmin();
