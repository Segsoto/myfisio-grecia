const test = require("node:test");
const assert = require("node:assert/strict");
const demo = require("../demo-store.js");
const NOW = new Date("2026-11-02T14:00:00Z"); // Monday, 08:00 in Costa Rica.
function fixture(storage) {
  const values = new Map();
  const memory = storage || {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
  return {
    store: demo.createStore(memory, () => NOW),
    memory,
    input: {
      name: "Paciente de prueba",
      serviceId: "rehab",
      date: "2026-11-03",
      time: "09:00",
    },
  };
}

test("a booking persists and blocks that time across every service", () => {
  const { store, memory, input } = fixture();
  const appointment = store.create(input);
  assert.equal(appointment.status, "pending");
  assert.equal(
    demo.createStore(memory, () => NOW).list()[0].id,
    appointment.id,
  );
  assert.equal(
    store.slots(input.date).find((s) => s.time === input.time).available,
    false,
  );
  assert.throws(
    () => store.create({ ...input, serviceId: "manual" }),
    /ya está apartado/,
  );
});
test("confirmation retains the slot; cancellation releases it", () => {
  const { store, input } = fixture();
  const appointment = store.create(input);
  store.updateStatus(appointment.id, "confirmed");
  assert.equal(store.list()[0].status, "confirmed");
  assert.equal(store.slots(input.date)[0].available, false);
  store.updateStatus(appointment.id, "cancelled");
  assert.equal(store.slots(input.date)[0].available, true);
  const replacement = store.create({ ...input, name: "Segundo ejemplo" });
  assert.throws(
    () => store.updateStatus(appointment.id, "pending"),
    /ya está apartado/,
  );
  assert.equal(
    store.list().find((item) => item.id === replacement.id).status,
    "pending",
  );
});
test("a cancelled appointment can be restored when its slot is available", () => {
  const { store, input } = fixture();
  const appointment = store.create(input);
  store.updateStatus(appointment.id, "cancelled");
  store.updateStatus(appointment.id, "pending");
  assert.equal(store.list()[0].status, "pending");
});
test("rejects invalid dates, Sundays, past hours, unknown services and empty names", () => {
  const { store, input } = fixture();
  for (const date of ["2026-02-30", "2026-11-01", "2026-12-03", "2026-11-08"])
    assert.throws(() => store.create({ ...input, date }));
  assert.throws(() =>
    store.create({ ...input, date: "2026-11-02", time: "08:00" }),
  );
  assert.throws(() => store.create({ ...input, serviceId: "unknown" }));
  assert.throws(() => store.create({ ...input, name: "  " }));
  assert.throws(() => store.updateStatus("missing-id", "confirmed"));
  assert.equal(store.list().length, 0);
});
test("uses Costa Rica date and time at the UTC day boundary", () => {
  const clock = new Date("2026-11-03T03:30:00Z"); // Nov 2, 21:30 CR.
  assert.equal(demo.today(clock), "2026-11-02");
  const store = demo.createStore(
    { getItem: () => null, setItem: () => {} },
    () => clock,
  );
  assert.ok(store.slots("2026-11-02").every((slot) => !slot.available));
  assert.equal(demo.addDays("2026-11-30", 1), "2026-12-01");
});
test("does not report a saved reservation if storage fails", () => {
  const { store, input } = fixture({
    getItem: () => null,
    setItem: () => {
      throw new Error("quota");
    },
  });
  assert.throws(() => store.create(input), /No se pudo guardar/);
});
test("preserves malformed data and reports a readable error", () => {
  for (const value of ["null", "{broken", '{"version":2,"appointments":[]}']) {
    let changed = false;
    const store = demo.createStore({
      getItem: () => value,
      setItem: () => {
        changed = true;
      },
    });
    assert.throws(() => store.list(), /datos de la demo/);
    assert.equal(changed, false);
  }
});
