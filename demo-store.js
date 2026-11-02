(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MyFisioDemo = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STORAGE_KEY = "myfisio.appointments.demo.v1";
  const TIME_ZONE = "America/Costa_Rica";
  const SERVICES = Object.freeze([
    { id: "rehab", name: "Fisioterapia y rehabilitación" },
    { id: "manual", name: "Terapia manual" },
    { id: "sport", name: "Lesiones deportivas" },
    { id: "work", name: "Lesiones laborales" },
  ]);
  // One fictional agenda. These hours and durations are only for the demo.
  const HOURS = Object.freeze([
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ]);
  const STATUS_LABELS = Object.freeze({
    pending: "Apartada",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
  });

  function localParts(now = new Date()) {
    return Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(now)
        .map(({ type, value }) => [type, value]),
    );
  }
  function today(now = new Date()) {
    const p = localParts(now);
    return `${p.year}-${p.month}-${p.day}`;
  }
  function parseDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      return null;
    const parsed = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
      ? parsed
      : null;
  }
  function addDays(value, days) {
    const date = parseDate(value);
    if (!date) throw new Error("La fecha no es válida.");
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
  function dateError(date, now = new Date()) {
    const parsed = parseDate(date);
    if (!parsed) return "Elegí una fecha válida.";
    if (date < today(now) || date > addDays(today(now), 30))
      return "Elegí una fecha dentro de los próximos 30 días.";
    if (parsed.getUTCDay() === 0)
      return "La agenda de ejemplo no tiene horarios los domingos.";
    return "";
  }
  function isPast(date, time, now = new Date()) {
    const p = localParts(now);
    return (
      date < today(now) ||
      (date === today(now) && time <= `${p.hour}:${p.minute}`)
    );
  }
  function formatDate(value) {
    const date = parseDate(value);
    return date
      ? new Intl.DateTimeFormat("es-CR", {
          timeZone: TIME_ZONE,
          weekday: "long",
          day: "numeric",
          month: "long",
        }).format(date)
      : value;
  }
  function reference(id) {
    return `DEMO-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  }
  function isRecord(value) {
    return (
      value &&
      typeof value.id === "string" &&
      /^[a-zA-Z0-9-]{8,80}$/.test(value.id) &&
      typeof value.name === "string" &&
      value.name.length > 0 &&
      value.name.length <= 60 &&
      SERVICES.some((s) => s.id === value.serviceId) &&
      parseDate(value.date) &&
      HOURS.includes(value.time) &&
      Object.hasOwn(STATUS_LABELS, value.status) &&
      typeof value.createdAt === "string" &&
      Number.isFinite(Date.parse(value.createdAt))
    );
  }

  function createStore(storage, clock = () => new Date()) {
    function list() {
      let raw;
      try {
        raw = storage.getItem(STORAGE_KEY);
      } catch {
        throw new Error(
          "El navegador no permite leer las citas de demo. Habilitá el almacenamiento local para continuar.",
        );
      }
      if (!raw) return [];
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          "Los datos de la demo no se pudieron leer. No se han modificado.",
        );
      }
      if (
        !data ||
        data.version !== 1 ||
        !Array.isArray(data.appointments) ||
        !data.appointments.every(isRecord)
      ) {
        throw new Error(
          "Los datos de la demo no tienen el formato esperado. No se han modificado.",
        );
      }
      return data.appointments;
    }
    function save(appointments) {
      try {
        storage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: 1, appointments }),
        );
      } catch {
        throw new Error(
          "No se pudo guardar la cita. Revisá el espacio y los permisos de almacenamiento del navegador.",
        );
      }
    }
    function slots(date) {
      const now = clock();
      if (dateError(date, now)) return [];
      const appointments = list();
      return HOURS.map((time) => ({
        time,
        available:
          !isPast(date, time, now) &&
          !appointments.some(
            (a) =>
              a.date === date && a.time === time && a.status !== "cancelled",
          ),
      }));
    }
    function assertAvailable(date, time, appointments, ignoreId) {
      const error = dateError(date, clock());
      if (error) throw new Error(error);
      if (!HOURS.includes(time) || isPast(date, time, clock()))
        throw new Error(
          "Elegí un horario disponible que todavía no haya pasado.",
        );
      if (
        appointments.some(
          (a) =>
            a.id !== ignoreId &&
            a.date === date &&
            a.time === time &&
            a.status !== "cancelled",
        )
      ) {
        throw new Error(
          "Ese horario ya está apartado en esta demo. Elegí otro.",
        );
      }
    }
    function create(input) {
      const name =
        typeof input.name === "string"
          ? input.name.trim().replace(/\s+/g, " ")
          : "";
      if (name.length < 2 || name.length > 60)
        throw new Error("Usá un nombre o alias de entre 2 y 60 caracteres.");
      if (!SERVICES.some((s) => s.id === input.serviceId))
        throw new Error("Seleccioná un servicio.");
      const appointments = list();
      assertAvailable(input.date, input.time, appointments);
      if (appointments.length >= 500)
        throw new Error("Esta demo alcanzó su límite de citas guardadas.");
      const id =
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      const appointment = {
        id,
        name,
        serviceId: input.serviceId,
        date: input.date,
        time: input.time,
        status: "pending",
        createdAt: clock().toISOString(),
      };
      save([...appointments, appointment]);
      return appointment;
    }
    function updateStatus(id, status) {
      if (!Object.hasOwn(STATUS_LABELS, status))
        throw new Error("El estado no es válido.");
      const appointments = list();
      const appointment = appointments.find((item) => item.id === id);
      if (!appointment)
        throw new Error("La cita ya no está disponible en esta demo.");
      if (status !== "cancelled")
        assertAvailable(
          appointment.date,
          appointment.time,
          appointments,
          appointment.id,
        );
      appointment.status = status;
      save(appointments);
      return appointment;
    }
    return Object.freeze({ list, slots, create, updateStatus });
  }
  return Object.freeze({
    STORAGE_KEY,
    TIME_ZONE,
    SERVICES,
    HOURS,
    STATUS_LABELS,
    today,
    addDays,
    dateError,
    formatDate,
    reference,
    createStore,
  });
});
