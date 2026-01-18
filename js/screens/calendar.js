import { store } from "../store.js";
import { router } from "../router.js";

export const CalendarScreen = {
  css: "css/screens/calendar.css",

  render() {
    const root = document.createElement("div");
    root.className = "calendar_screen";

    const year = document.createElement("div");
    year.className = "calendar_year";
    year.innerHTML = `
      <span class="prefix">20</span>
      <span class="slots">
        <span class="slot" data-slot="tens"><span class="digit">2</span></span>
        <span class="slot" data-slot="ones"><span class="digit">6</span></span>
      </span>
    `;

    root.appendChild(year);

    const text = document.createElement("div");
    text.className = "calendar_text";
    text.innerHTML = `
        <p class="line">Esto puede ser solo una historia.</p>
        <p class="line">O algo que ocurrió…</p>
        <p class="line">…y no recordamos.</p>`;

    root.appendChild(text);

    return root;
  },

  mount(rootEl) {
    const yearEl = rootEl.querySelector(".calendar_year");
    const tensSlot = yearEl.querySelector('.slot[data-slot="tens"]');
    const onesSlot = yearEl.querySelector('.slot[data-slot="ones"]');

    let current = 2026;

    // timing
    let delay = 520;
    const minDelay = 90;
    const accel = 0.86;

    let timeoutId = null;
    let destroyed = false;

    const wait = (ms) =>
      new Promise((res) => {
        timeoutId = setTimeout(res, ms);
      });

    /* =========================
       AUDIO (keypress)
       ========================= */
    const keyAudio = new Audio("../../assets/audio/keys/keypress-016.wav");
    keyAudio.preload = "auto";
    // En algunos navegadores ayuda para móviles
    keyAudio.playsInline = true;

    let audioUnlocked = false;
    const unlockAudio = () => {
      if (audioUnlocked) return;
      audioUnlocked = true;
      // Intento “silencioso” para desbloquear (puede fallar si no hay gesto)
      try {
        keyAudio.volume = 0.0001;
        const p = keyAudio.play();
        if (p && typeof p.then === "function") {
          p.then(() => {
            keyAudio.pause();
            keyAudio.currentTime = 0;
            keyAudio.volume = 1;
          }).catch(() => {
            // si falla, lo dejamos; volveremos a intentar al primer tick
            keyAudio.volume = 1;
          });
        } else {
          keyAudio.pause();
          keyAudio.currentTime = 0;
          keyAudio.volume = 1;
        }
      } catch (e) {
        keyAudio.volume = 1;
      }
    };

    // si el usuario toca/clica en cualquier parte, desbloqueamos audio
    rootEl.addEventListener("pointerdown", unlockAudio, { once: true });

    function playKey() {
      // Reproducimos sincronizado con el cambio.
      // Si el navegador lo bloquea, no rompemos nada.
      try {
        keyAudio.pause();
        keyAudio.currentTime = 0;
        const p = keyAudio.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch (e) {}
    }

    /* =========================
       ANIMATION
       ========================= */
    function animateSlot(slotEl, nextDigit) {
      const outEl = slotEl.querySelector(".digit");

      const inEl = document.createElement("span");
      inEl.className = "digit is_in";
      inEl.textContent = nextDigit;

      slotEl.appendChild(inEl);

      if (outEl) outEl.classList.add("is_out");

      return new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          if (destroyed) return resolve();

          if (outEl && outEl.parentNode) outEl.remove();
          inEl.classList.remove("is_in");
          resolve();
        }, 190);
      });
    }

    async function animateYearChange(nextYear) {
      const curStr = String(current);
      const nextStr = String(nextYear);

      const curTens = curStr[curStr.length - 2];
      const curOnes = curStr[curStr.length - 1];
      const nextTens = nextStr[nextStr.length - 2];
      const nextOnes = nextStr[nextStr.length - 1];

      const jobs = [];

      // 🔊 SONIDO: una sola vez por “tick”, justo antes de que empiece el movimiento
      if (curTens !== nextTens || curOnes !== nextOnes) {
        playKey();
      }

      if (curTens !== nextTens) jobs.push(animateSlot(tensSlot, nextTens));
      if (curOnes !== nextOnes) jobs.push(animateSlot(onesSlot, nextOnes));

      await Promise.all(jobs);
    }

    async function run() {
      await wait(500);
      if (destroyed) return;

      while (current > 2016 && !destroyed) {
        const next = current - 1;

        await animateYearChange(next);
        if (destroyed) return;

        current = next;
        delay = Math.max(minDelay, Math.floor(delay * accel));

        await wait(delay);
        if (destroyed) return;
      }

      // en 2016: mantener 2s
      await wait(2000);
      if (destroyed) return;

      // ocultar número
      yearEl.classList.add("is_hidden");

      // pantalla vacía 2s
      await wait(2000);
      if (destroyed) return;

        const screenEl = yearEl.parentElement;
        const textEl = screenEl.querySelector(".calendar_text");
        const lines = textEl.querySelectorAll(".line");

        textEl.classList.add("is_visible");

        await wait(300);

        for (const line of lines) {
        line.classList.add("is_visible");
        await wait(1200);
        }

        await wait(2000);
        if (destroyed) return;

        store.updateProgress({ screenId: "salon" });
        router.go("salon"); // ← AÑADE ESTA LÍNEA
    }

    run();

    return {
      cleanup() {
        destroyed = true;
        if (timeoutId) clearTimeout(timeoutId);
        rootEl.removeEventListener("pointerdown", unlockAudio);
      }
    };
  }
};
