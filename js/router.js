const screens = {};
let current = null;
let currentStyleEl = null;

export const router = {
  register(name, screen) {
    screens[name] = screen;
  },
  
  go(name, params = {}) {
    // Cleanup anterior
    if (current && current.cleanup) current.cleanup();
    
    // Eliminar CSS anterior
    if (currentStyleEl) {
      currentStyleEl.remove();
      currentStyleEl = null;
    }
    
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    const screen = screens[name];
    if (!screen) return;
    
    // Cargar CSS de la screen si existe
    if (screen.css) {
      currentStyleEl = document.createElement('link');
      currentStyleEl.rel = 'stylesheet';
      currentStyleEl.href = screen.css;
      document.head.appendChild(currentStyleEl);
    }
    
    const el = screen.render(params);
    app.appendChild(el);
    current = screen.mount ? screen.mount(el, params) : null;
  }
};