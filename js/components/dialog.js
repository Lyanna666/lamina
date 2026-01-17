export function Dialog(text) {
  const div = document.createElement('div');
  div.className = 'dialog';
  div.textContent = text;
  return div;
}
