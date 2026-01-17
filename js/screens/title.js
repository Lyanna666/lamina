import { router } from '../router.js';

const Title = {
  render() {
    const div = document.createElement('div');
    div.innerHTML = '<h1>Mystery Game</h1><button id="start">Start</button>';
    return div;
  },
  mount(el) {
    const btn = el.querySelector('#start');
    btn.addEventListener('click', () => router.go('title'));
    return {
      cleanup() {
        btn.removeEventListener('click', () => {});
      }
    };
  }
};

router.register('title', Title);
