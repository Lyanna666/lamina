import { store } from "../store.js";

// Datos de la escena
const DIALOGUE = [
  { speaker: "luz", text: "Oye… ¿y si nos vamos unos días fuera?" },
  { speaker: "angel", text: "¿De vacaciones?" },
  { speaker: "luz", text: "Sí. Algo tranquilo. Nos vendría bien cambiar de aires." },
  { speaker: "luz", text: "He estado mirando por internet. Casas rurales, pueblos pequeños…" },
  { speaker: "angel", text: "¿Algún sitio en concreto?" },
  { speaker: "luz", text: "Uno que no conocía. Es barato… y parece muy tranquilo." },
  { speaker: "angel", text: "Si al resto les apetece, por mí perfecto." },
  { speaker: "luz", text: "Les encantará. Será una pequeña aventura..." }
];


// Sonidos de tecleo
const KEYPRESS_SOUNDS = [
  "keypress-001.wav", "keypress-002.wav", "keypress-003.wav", "keypress-004.wav",
  "keypress-005.wav", "keypress-006.wav", "keypress-007.wav", "keypress-008.wav",
  "keypress-009.wav", "keypress-010.wav", "keypress-011.wav", "keypress-012.wav",
  "keypress-013.wav", "keypress-014.wav", "keypress-015.wav", "keypress-016.wav",
  "keypress-017.wav", "keypress-018.wav", "keypress-019.wav", "keypress-020.wav",
  "keypress-021.wav", "keypress-022.wav", "keypress-023.wav", "keypress-024.wav",
  "keypress-025.wav", "keypress-026.wav", "keypress-027.wav", "keypress-028.wav",
  "keypress-029.wav", "keypress-030.wav", "keypress-031.wav", "keypress-032.wav"
];

export const SalonScene = {
  css: "css/screens/salon_scene.css",
  
  render() {
    const root = document.createElement("div");
    root.className = "salon_scene";
    
    // Fondo
    const bg = document.createElement("img");
    bg.className = "salon_background";
    bg.src = "../../assets/cap_1/salon.png";
    bg.alt = "Salón";
    
    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "salon_overlay";
    
    // Personajes
    const characters = document.createElement("div");
    characters.className = "salon_characters";
    
    const angel = document.createElement("img");
    angel.className = "character_angel";
    angel.src = "../../assets/cap_1/angel.png";
    angel.alt = "Ángel";
    
    const luz = document.createElement("img");
    luz.className = "character_luz";
    luz.src = "../../assets/cap_1/luz.png";
    luz.alt = "Luz";
    
    characters.appendChild(angel);
    characters.appendChild(luz);
    
    // Caja de diálogo
    const dialogueBox = document.createElement("div");
    dialogueBox.className = "dialogue_box";
    
    const dialogueName = document.createElement("div");
    dialogueName.className = "dialogue_name";
    
    const dialogueText = document.createElement("div");
    dialogueText.className = "dialogue_text";
    
    const dialogueArrow = document.createElement("div");
    dialogueArrow.className = "dialogue_arrow";
    dialogueArrow.textContent = "▶";
    dialogueArrow.style.display = "none";
    
    dialogueBox.appendChild(dialogueName);
    dialogueBox.appendChild(dialogueText);
    dialogueBox.appendChild(dialogueArrow);
    
    root.appendChild(bg);
    root.appendChild(overlay);
    root.appendChild(characters);
    root.appendChild(dialogueBox);
    
    return root;
  },
  
  mount(rootEl) {
    const dialogueBox = rootEl.querySelector(".dialogue_box");
    const dialogueName = rootEl.querySelector(".dialogue_name");
    const dialogueText = rootEl.querySelector(".dialogue_text");
    const dialogueArrow = rootEl.querySelector(".dialogue_arrow");
    const luzImg = rootEl.querySelector(".character_luz");
    const angelImg = rootEl.querySelector(".character_angel");
    
    let currentDialogueIndex = 0;
    let isTyping = false;
    let typewriterTimeout;
    
    // Audio pool para sonidos de tecleo
    const audioPool = [];
    const poolSize = 5;
    
    for (let i = 0; i < poolSize; i++) {
      audioPool.push(new Audio());
    }
    
    let audioIndex = 0;
    
    function playKeypressSound() {
      const randomSound = KEYPRESS_SOUNDS[Math.floor(Math.random() * KEYPRESS_SOUNDS.length)];
      const audio = audioPool[audioIndex];
      audio.src = `assets/audio/keys/${randomSound}`;
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignorar errores de reproducción
      audioIndex = (audioIndex + 1) % poolSize;
    }
    
    // Sistema de parpadeo para Luz
    let blinkInterval;
    function startBlinking() {
      blinkInterval = setInterval(() => {
        // Parpadear cada 3-5 segundos aleatoriamente
        const delay = 3000 + Math.random() * 2000;
        
        setTimeout(() => {
          luzImg.src = "assets/cap_1/luz_cerrados.png";
          setTimeout(() => {
            luzImg.src = "assets/cap_1/luz.png";
          }, 150);
        }, delay);
      }, 5000);
    }
    
    // Sistema de parpadeo para Ángel
    let angelBlinkInterval;
    function startAngelBlinking() {
      angelBlinkInterval = setInterval(() => {
        const delay = 3000 + Math.random() * 2000;
        
        setTimeout(() => {
          angelImg.src = "assets/cap_1/angel_cerrados.png";
          setTimeout(() => {
            angelImg.src = "assets/cap_1/angel.png";
          }, 150);
        }, delay);
      }, 5000);
    }
    
    // Efecto typewriter
    function typeText(text, callback) {
      isTyping = true;
      dialogueArrow.style.display = "none";
      dialogueText.textContent = "";
      
      let charIndex = 0;
      
      function typeChar() {
        if (charIndex < text.length) {
          dialogueText.textContent += text[charIndex];
          playKeypressSound();
          charIndex++;
          typewriterTimeout = setTimeout(typeChar, 40); // 40ms por letra
        } else {
          isTyping = false;
          dialogueArrow.style.display = "block";
          dialogueBox.classList.add("waiting");
          if (callback) callback();
        }
      }
      
      typeChar();
    }
    
    // Mostrar diálogo
    function showDialogue(index) {
      if (index >= DIALOGUE.length) {
        // Fin de la escena
        setTimeout(() => {
          store.updateProgress({ screenId: "next_scene" });
          console.log("Fin de la escena del salón");
        }, 500);
        return;
      }
      
      const dialogue = DIALOGUE[index];
      
      // Actualizar nombre y posición
      dialogueName.textContent = dialogue.speaker === "angel" ? "Ángel" : "Luz";
      dialogueBox.className = "dialogue_box speaker_" + dialogue.speaker;
      
      // Escribir texto
      typeText(dialogue.text);
    }
    
    // Click para avanzar
    function handleClick() {
      if (isTyping) {
        // Saltar animación de escritura
        clearTimeout(typewriterTimeout);
        const dialogue = DIALOGUE[currentDialogueIndex];
        dialogueText.textContent = dialogue.text;
        isTyping = false;
        dialogueArrow.style.display = "block";
        dialogueBox.classList.add("waiting");
      } else {
        // Avanzar al siguiente diálogo
        dialogueBox.classList.remove("waiting");
        currentDialogueIndex++;
        showDialogue(currentDialogueIndex);
      }
    }
    
    dialogueBox.addEventListener("click", handleClick);
    
    // Iniciar
    startBlinking();
    startAngelBlinking();
    showDialogue(0);
    
    return {
      cleanup() {
        clearInterval(blinkInterval);
        clearInterval(angelBlinkInterval);
        clearTimeout(typewriterTimeout);
        dialogueBox.removeEventListener("click", handleClick);
      }
    };
  }
};