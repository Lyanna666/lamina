import { el } from "../dom.js";
import { router } from "../router.js";
import { store } from "../store.js";

export const CalendarScreen = {
  css: "css/screens/calendar.css",
  
  render() {
    const root = el("div", { class: "calendar_screen" });
    
    const calendarWrap = el("div", { class: "calendar_wrap" });
    const year = el("div", { class: "calendar_year", text: "2026" });
    const month = el("div", { class: "calendar_month", text: "ENERO" });
    
    calendarWrap.appendChild(year);
    calendarWrap.appendChild(month);
    
    root.appendChild(calendarWrap);
    
    return root;
  },
  
  mount(rootEl) {
    const yearEl = rootEl.querySelector(".calendar_year");
    const monthEl = rootEl.querySelector(".calendar_month");
    const calendarWrap = rootEl.querySelector(".calendar_wrap");
    
    const months = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];
    
    let currentYear = 2026;
    let currentMonth = 0; // Enero
    
    const animatePageFall = () => {
      // Crear hoja que cae
      const fallingPage = el("div", { class: "calendar_page_falling" });
      fallingPage.innerHTML = `
        <div class="calendar_year">${currentYear}</div>
        <div class="calendar_month">${months[currentMonth]}</div>
      `;
      
      calendarWrap.appendChild(fallingPage);
      
      // Eliminar la hoja después de la animación
      setTimeout(() => {
        fallingPage.remove();
      }, 800);
      
      // Retroceder mes
      currentMonth--;
      
      if (currentMonth < 0) {
        currentYear--;
        currentMonth = 11; // Diciembre
      }
      
      // Actualizar calendario principal
      yearEl.textContent = currentYear;
      monthEl.textContent = months[currentMonth];
      
      // Si llegamos a 2016, detener
      if (currentYear < 2016) {
        clearInterval(interval);
        
        // Guardar progreso y avanzar a siguiente pantalla
        setTimeout(() => {
          store.updateProgress({ screenId: "next_screen" });
          // router.go("next_screen"); // Descomentar cuando exista
          console.log("Llegamos a 2016 - siguiente pantalla");
        }, 1000);
      }
    };
    
    // Comenzar animación después de un momento
    setTimeout(() => {
      const interval = setInterval(animatePageFall, 400);
    }, 500);
    
    return {
      cleanup() {
        // Limpiar si es necesario
      }
    };
  }
};