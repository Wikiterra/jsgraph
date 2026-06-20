// Shared app shell — a thin top nav so both apps share branding and an
// app-switcher when served together (`pnpm dev` → workspace-root Vite). Each app's
// ESM entry imports this once; it prepends a <header> to <body>.
//
// Links are relative to /apps/<app>/, so they resolve under the root dev server and
// the unified build. (Under a per-app dev server there's no sibling app, so the
// cross-link is inert — per-app dev is for focusing on one app.)
import './appShell.css';

const APPS = [
  { slug: 'earth-drop-calc', label: 'Curvature Calc' },
  { slug: 'fed-wabis-v2', label: 'Dome Model' },
];

const path = location.pathname;
const links = APPS.map((a) => {
  const active = path.includes('/' + a.slug + '/') || path.endsWith('/' + a.slug);
  return `<a href="../${a.slug}/"${active ? ' class="active" aria-current="page"' : ''}>${a.label}</a>`;
}).join('');

const header = document.createElement('header');
header.className = 'app-shell-nav';
header.innerHTML = `<a class="brand" href="../../">WikiTerra</a><nav>${links}</nav>`;
document.body.prepend(header);
