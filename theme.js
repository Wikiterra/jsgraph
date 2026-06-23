// Theme toggle for the static pages. The initial theme is set before paint by
// the inline script in each page's <head>; this only wires the toggle button and
// persists the choice. A manual choice overrides the OS preference from then on.
const root = document.documentElement;
const btn = document.getElementById('theme-toggle');

if (btn) {
  const meta = document.querySelector('meta[name="theme-color"]');
  const sync = () => {
    const dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('title', dark ? 'Switch to light theme' : 'Switch to dark theme');
    if (meta) meta.setAttribute('content', dark ? '#120c24' : '#f5f6f8');
  };
  sync();
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    sync();
  });
}
