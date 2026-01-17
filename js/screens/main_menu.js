import { el, clear } from "../dom.js";
import { store } from "../store.js";
import { router } from "../router.js";

function screenLabel(progress){
  const screenId = progress?.screenId || "calendar";
  return `Progreso: ${screenId}`;
}

function openModal(contentEl){
  const backdrop = el("div", { class: "ui_modal_backdrop" });
  backdrop.appendChild(contentEl);

  const onKey = (e) => { if (e.key === "Escape") close(); };
  const close = () => {
    document.removeEventListener("keydown", onKey);
    backdrop.remove();
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener("keydown", onKey);

  document.body.appendChild(backdrop);
  return { close };
}

function promptNewGame(){
  const slots = [0,1,2].map(i => store.getSlot(i));
  const hasEmpty = slots.some(s => !s);
  const mustOverwrite = !hasEmpty;

  let overwriteIndex = null;

  const modal = el("div", { class: "ui_modal" }, [
    el("h2", { text: mustOverwrite ? "Nueva partida (elige una para sustituir)" : "Nueva partida" }),
    el("div", { class: "ui_field" }, [
      el("div", { text: "Nombre de la partida" }),
      el("input", { class: "ui_input", type: "text", value: "Partida de Ángel", maxlength: "24" })
    ]),
  ]);

  const input = modal.querySelector("input");

  if (mustOverwrite){
    const list = el("div", { class: "ui_slots" });

    [0,1,2].forEach(i => {
      const s = store.getSlot(i);
      const title = s ? `Sustituir: ${s.name}` : `Sustituir: Partida ${i+1}`;
      const meta = s ? screenLabel(s.progress) : "Vacía";

      const btn = el("button", { class: "ui_slot_btn" }, [
        el("div", {}, [
          el("div", { text: title }),
          el("div", { class: "ui_slot_meta", text: meta })
        ]),
        el("div", { text: "→" })
      ]);

      btn.addEventListener("click", () => {
        overwriteIndex = i;
        [...list.querySelectorAll("button")].forEach(b => b.style.outline = "");
        btn.style.outline = "2px solid rgba(231,196,122,0.8)";
      });

      list.appendChild(btn);
    });

    modal.insertBefore(list, modal.querySelector(".ui_field").nextSibling);
  }

  const actions = el("div", { class: "ui_modal_actions" });
  const cancelBtn = el("button", { class: "ui_secondary", text: "Cancelar" });
  const okBtn = el("button", { class: "ui_primary", text: "Crear" });

  actions.appendChild(cancelBtn);
  actions.appendChild(okBtn);
  modal.appendChild(actions);

  const { close } = openModal(modal);

  cancelBtn.addEventListener("click", close);

  okBtn.addEventListener("click", () => {
    const name = (input.value || "").trim();
    if (!name) { input.focus(); return; }

    if (mustOverwrite && overwriteIndex === null) return;

    if (mustOverwrite) store.overwriteSlot(overwriteIndex, { name });
    else store.createNewGame({ name });

    close();
    
    // Ir directamente a la primera pantalla (calendar)
    const slot = store.getActiveSlot();
    router.go(slot.progress.screenId);
  });

  setTimeout(() => input.focus(), 0);
}

export const MainMenuScreen = {
  css: "css/screens/main_menu.css",
  
  render(){
    const root = el("div", { class: "ui_screen" });
    const panel = el("div", { class: "ui_panel" });

    const logo = el("div", { class: "ui_logo_wrap" }, [
      el("img", {
        class: "ui_logo",
        src: "assets/ui/logo_recuerdo_olvidado.png",
        alt: "Recuerdo Olvidado"
      })
    ]);

    const slotsWrap = el("div", { class: "ui_slots" });

    const buildSlots = () => {
      clear(slotsWrap);

      [0,1,2].forEach((i) => {
        const s = store.getSlot(i);

        const title = s ? `Partida ${i+1}: ${s.name}` : `Partida ${i+1}: (vacía)`;
        const meta = s ? screenLabel(s.progress) : "Crea una nueva partida para empezar.";

        const btn = el("button", {
          class: "ui_slot_btn",
          disabled: s ? null : "true"
        }, [
          el("div", {}, [
            el("div", { text: title }),
            el("div", { class: "ui_slot_meta", text: meta })
          ]),
          el("div", { text: s ? "Continuar" : "" })
        ]);

        btn.addEventListener("click", () => {
          if (!s) return;
          store.setActiveSlot(i);
          // Ir a la pantalla guardada
          router.go(s.progress.screenId);
        });

        slotsWrap.appendChild(btn);
      });
    };

    buildSlots();

    const actions = el("div", { class: "ui_actions" }, [
      el("button", { class: "ui_primary", text: "Nueva partida", onclick: () => promptNewGame() }),
    ]);

    panel.appendChild(logo);
    panel.appendChild(slotsWrap);
    panel.appendChild(actions);

    root.appendChild(panel);
    return root;
  }
};