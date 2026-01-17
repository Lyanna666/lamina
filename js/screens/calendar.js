import { store } from "../store.js";

export const CalendarScreen = {
  css: "css/screens/calendar.css",
  
  render() {
    const root = document.createElement("div");
    root.className = "calendar_screen";
    
    const flip = document.createElement("div");
    flip.className = "flip";
    flip.innerHTML = `
      <div class="top"><span>2026</span></div>
      <div class="bottom"><span>2026</span></div>
    `;
    
    root.appendChild(flip);
    return root;
  },
  
  mount(rootEl) {
    const flipEl = rootEl.querySelector(".flip");
    let currentYear = 2026;
    let currentDelay = 1200;
    const minDelay = 200;
    const acceleration = 0.88;
    let timeoutId;
    
    function flipYear() {
      if (currentYear <= 2016) {
        setTimeout(() => {
          store.updateProgress({ screenId: "next_screen" });
          console.log("Llegamos a 2016");
        }, 1500);
        return;
      }
      
      const nextYear = currentYear - 1;
      
      // Crear elementos animados
      const flipTop = document.createElement("div");
      flipTop.className = "flip-top";
      flipTop.innerHTML = `<span>${currentYear}</span>`;
      
      const flipBottom = document.createElement("div");
      flipBottom.className = "flip-bottom";
      flipBottom.innerHTML = `<span>${nextYear}</span>`;
      
      flipEl.appendChild(flipTop);
      flipEl.appendChild(flipBottom);
      
      // Actualizar los elementos fijos
      setTimeout(() => {
        flipEl.querySelector(".top span").textContent = nextYear;
        flipEl.querySelector(".bottom span").textContent = nextYear;
        flipTop.remove();
        flipBottom.remove();
        
        currentYear = nextYear;
        currentDelay = Math.max(minDelay, currentDelay * acceleration);
        timeoutId = setTimeout(flipYear, currentDelay);
      }, 900);
    }
    
    timeoutId = setTimeout(flipYear, 1000);
    
    return {
      cleanup() {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };
  }
};