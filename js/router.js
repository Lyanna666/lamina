const screens = {};
let current = null;

export const router = {
  register(name, screen) {
    screens[name] = screen;
  },
  go(name, params = {}) {
    if (current && current.cleanup) current.cleanup();
    const app = document.getElementById('app');
    app.innerHTML = '';
    const screen = screens[name];
    if (!screen) return;
    const el = screen.render(params);
    app.appendChild(el);
    current = screen.mount ? screen.mount(el, params) : null;
  }
};
