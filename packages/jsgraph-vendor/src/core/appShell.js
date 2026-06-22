// Shared app shell — injects the "WikiTerra Jsgraph" brand into the existing
// #top-bar of each app. The brand links home; no app-switcher links.
// Runs as a side-effect import.
import './appShell.css';

const bar = document.getElementById('top-bar');
if (bar) {
  const brand = document.createElement('a');
  brand.className = 'app-shell-brand';
  brand.href = '../../';
  brand.textContent = 'WikiTerra Jsgraph';
  bar.insertBefore(brand, bar.firstChild);
}
