// js/store.js
// Store oficial de Recuerdo Olvidado
// - 3 slots de partida
// - nombre, progreso (screenId), timestamps
// - activeSlot
// - persistencia en localStorage

const KEY_SLOTS = "recuerdo_olvidado_slots_v1";
const KEY_ACTIVE = "recuerdo_olvidado_active_slot_v1";

function nowISO() {
  return new Date().toISOString();
}

function safeParse(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function makeEmptySlots() {
  return [null, null, null];
}

function normalizeSlots(slots) {
  const s = Array.isArray(slots) ? slots.slice(0, 3) : makeEmptySlots();
  while (s.length < 3) s.push(null);
  return s.map(v => (v && typeof v === "object") ? v : null);
}

function makeNewSlot(name) {
  return {
    name: String(name || "Partida").trim() || "Partida",
    progress: {
      screenId: "calendar",  // Pantalla inicial
    },
    createdAt: nowISO(),
    updatedAt: nowISO(),
    flags: {},      // para logros/variables más adelante
  };
}

export const store = {
  slots: makeEmptySlots(),
  activeSlotIndex: null,

  load() {
    const rawSlots = localStorage.getItem(KEY_SLOTS);
    this.slots = normalizeSlots(rawSlots ? safeParse(rawSlots, makeEmptySlots()) : makeEmptySlots());

    const rawActive = localStorage.getItem(KEY_ACTIVE);
    const idx = rawActive !== null && rawActive !== "" ? Number(rawActive) : null;
    this.activeSlotIndex = Number.isFinite(idx) && idx >= 0 && idx < 3 ? idx : null;
  },

  save() {
    localStorage.setItem(KEY_SLOTS, JSON.stringify(this.slots));
    localStorage.setItem(KEY_ACTIVE, this.activeSlotIndex === null ? "" : String(this.activeSlotIndex));
  },

  // --- Slots ---
  getSlot(i) {
    return this.slots[i] || null;
  },

  setActiveSlot(i) {
    if (!Number.isFinite(i) || i < 0 || i > 2) throw new Error("Invalid slot index");
    if (!this.slots[i]) throw new Error("Slot is empty");
    this.activeSlotIndex = i;
    this.save();
  },

  getActiveSlot() {
    if (this.activeSlotIndex === null) return null;
    return this.slots[this.activeSlotIndex] || null;
  },

  // Crear nueva partida: usa el primer slot vacío si existe.
  // Si no hay, lanza error (el menú ya fuerza overwrite en ese caso).
  createNewGame({ name }) {
    const idx = this.slots.findIndex(s => s === null);
    if (idx === -1) throw new Error("No empty slots");
    this.slots[idx] = makeNewSlot(name);
    this.activeSlotIndex = idx;
    this.save();
    return idx;
  },

  // Sustituye una partida existente por una nueva
  overwriteSlot(i, { name }) {
    if (!Number.isFinite(i) || i < 0 || i > 2) throw new Error("Invalid slot index");
    this.slots[i] = makeNewSlot(name);
    this.activeSlotIndex = i;
    this.save();
    return i;
  },

  // Actualiza progreso (pantalla actual)
  updateProgress({ screenId }) {
    const slot = this.getActiveSlot();
    if (!slot) throw new Error("No active slot");
    slot.progress.screenId = screenId ?? slot.progress.screenId;
    slot.updatedAt = nowISO();
    this.save();
  },

  // Flags/variables de historia
  setFlag(key, value = true) {
    const slot = this.getActiveSlot();
    if (!slot) throw new Error("No active slot");
    slot.flags[key] = value;
    slot.updatedAt = nowISO();
    this.save();
  },

  getFlag(key, fallback = null) {
    const slot = this.getActiveSlot();
    if (!slot) return fallback;
    return (key in slot.flags) ? slot.flags[key] : fallback;
  },

  // Debug / reset si hace falta
  resetAll() {
    this.slots = makeEmptySlots();
    this.activeSlotIndex = null;
    this.save();
  }
};