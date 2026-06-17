// One-shot codemod: make a classic-script wabis file safe to load BOTH as a
// classic <script> AND as an ESM module. Strategy:
//   1. declare any implicit top-level global (`X = ...` -> `var X = ...`)
//   2. append `Object.assign(globalThis, { <all top-level globals> })` so the
//      module-scoped vars become real globals the next imported file can see.
// No `export` is emitted (would break classic <script> loading).
//
// Top-level = brace-depth 0. wabis packs many statements per line, so we can't
// go line-by-line: we mask strings/comments, track `{}` depth, and collect
// `var|let|const|function NAME` declarations that occur at depth 0.
import { readFileSync, writeFileSync } from 'node:fs';

const KW = new Set(['var', 'let', 'const', 'function', 'if', 'for', 'while',
  'switch', 'return', 'this', 'new', 'typeof', 'window', 'globalThis']);

// Replace string/comment/regex bodies with spaces (same length) so their braces
// and keyword-like contents don't perturb depth/matching.
function mask(src) {
  const out = src.split('');
  let i = 0, prev = '';
  const blank = (a, b) => { for (let k = a; k < b; k++) if (out[k] !== '\n') out[k] = ' '; };
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (c === '/' && n === '/') { let j = i + 2; while (j < src.length && src[j] !== '\n') j++; blank(i, j); i = j; continue; }
    if (c === '/' && n === '*') { let j = i + 2; while (j < src.length && !(src[j] === '*' && src[j + 1] === '/')) j++; j += 2; blank(i, j); i = j; continue; }
    if (c === '"' || c === "'" || c === '`') { let j = i + 1; while (j < src.length && src[j] !== c) { if (src[j] === '\\') j++; j++; } blank(i + 1, j); i = j + 1; prev = c; continue; }
    // regex literal: `/` where a value can't precede it (prev is operator-ish)
    if (c === '/' && /[=(,:;{}!&|?+\-*%~^[<>]|^$/.test(prev || '')) {
      let j = i + 1, inCls = false;
      while (j < src.length && (src[j] !== '/' || inCls)) { if (src[j] === '\\') j++; else if (src[j] === '[') inCls = true; else if (src[j] === ']') inCls = false; j++; }
      blank(i + 1, j); i = j + 1; prev = '/'; continue;
    }
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out.join('');
}

for (const file of process.argv.slice(2)) {
  let src = readFileSync(file, 'utf8');
  // 1. implicit globals: a line that starts (col 0) with `NAME = ` and no decl kw.
  src = src.replace(/^([A-Za-z_$][\w$]*)(\s*=(?!=))/gm, (m, name, rest) =>
    KW.has(name) ? m : 'var ' + name + rest);

  const masked = mask(src);
  // depth array over masked
  let depth = 0;
  const depthAt = new Array(masked.length);
  for (let k = 0; k < masked.length; k++) {
    const ch = masked[k];
    if (ch === '}') depth--;
    depthAt[k] = depth;
    if (ch === '{') depth++;
  }
  const names = new Set();
  const re = /\b(var|let|const|function)\s+([A-Za-z_$][\w$]*)/g;
  let mm;
  while ((mm = re.exec(masked))) {
    if (depthAt[mm.index] !== 0) continue;
    if (mm[1] === 'function') {
      // only a function *declaration* binds a name; skip expressions
      // (`=function`, `(function`, `,function`, `:function`, `return function`…)
      let p = mm.index - 1;
      while (p >= 0 && /\s/.test(masked[p])) p--;
      if (!(p < 0 || masked[p] === ';' || masked[p] === '{' || masked[p] === '}')) continue;
    }
    names.add(mm[2]);
  }
  const list = [...names];
  if (list.length) src += `\nObject.assign(globalThis, { ${list.join(', ')} });\n`;
  writeFileSync(file, src);
  console.log(`${file}: ${list.length} globals`);
}
