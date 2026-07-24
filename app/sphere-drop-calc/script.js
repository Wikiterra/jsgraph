const R = 6371; // Radius of the spherical Earth in km

// ---------------------------------------------------------------------------
// Refraction — same model as the earth-horizon-sim app's "Std" atmosphere
// (app/earth-horizon-sim/app/core/physics.js computeRefractionCoeff/
// computeRefractionFactor/computeRefractedRadius): k from the Edlén-derived
// formula at sea-level pressure/temperature with the standard optical
// temperature gradient, then an enlarged effective Earth radius R' = R/(1-k)
// that light effectively curves around.
// ---------------------------------------------------------------------------
const REFR_COEFF_CONST = 503;    // K/mb, Edlén formula constant
const STD_TEMP_GRADIENT = 0.0343; // K/m, ICAO standard atmosphere lapse rate
const STD_PRESSURE_MBAR = 1013.25;
const STD_TEMPERATURE_K = 288.15; // 15 °C
const STD_DTDH = -0.002;          // K/m, standard optical refraction gradient

function computeRefractionCoeff(P_mbar, T_K, dTdh) {
  return REFR_COEFF_CONST * (P_mbar / (T_K * T_K)) * (STD_TEMP_GRADIENT + dTdh);
}

const REFRACTION_K = computeRefractionCoeff(STD_PRESSURE_MBAR, STD_TEMPERATURE_K, STD_DTDH);
const REFRACTION_FACTOR = 1 / (1 - REFRACTION_K);
const R_OPTICAL = R * REFRACTION_FACTOR; // refracted (effective) Earth radius, km

/** Format a number for display, or an en-dash placeholder when not finite. */
function fmt(n, decimals) {
  return Number.isFinite(n) ? n.toFixed(decimals === undefined ? 3 : decimals) : '–';
}

function renderStaticFormulas() {
  // Method 1: Pythagoras — symbolic derivation (fixed; numbers are substituted live below each line).
  katex.render(String.raw`(R + h_0)^2 = d_1^2 + R^2 \Rightarrow d_1 = \sqrt{h_0^2 + 2Rh_0}`,
    document.getElementById('formula-pythagoras-1'));
  katex.render(String.raw`d_2 = d - d_1 \Rightarrow h_1 = \sqrt{d_2^2 + R^2} - R`,
    document.getElementById('formula-pythagoras-2'));

  // Method 2: Perimeter of a circle
  katex.render(String.raw`C = 2\pi R`, document.getElementById('formula-perimeter-1'));
  katex.render(String.raw`\alpha = \dfrac{d}{R}`, document.getElementById('formula-perimeter-2'));
  katex.render(String.raw`h_1 = R(1 - \cos\alpha)`, document.getElementById('formula-perimeter-3'));

  // Method 3: Trigonometry
  katex.render(String.raw`\alpha = \dfrac{d}{R}`, document.getElementById('formula-trigonometry-1'));
  katex.render(String.raw`h_1 = R(1 - \cos\alpha) \Rightarrow h_1 = R\left(\dfrac{1}{\cos(d/R)} - 1\right)`,
    document.getElementById('formula-trigonometry-2'));

  katex.render(String.raw`d_1 \approx 113\sqrt{h_0}\ \text{(km, } h_0 \text{ in km)}`,
    document.getElementById('d-geometric-horizon-equation'));
}

/**
 * Hidden height via the Pythagorean theorem.
 * @param {number} h0 - Observer height in km.
 * @param {number} d - Total observed distance in km.
 * @param {number} [radius] - Earth radius to use (geometric R, or refracted R').
 * @returns {{d1: number, d2: number, h1: number}}
 */
function calcDropPythagoras(h0, d, radius) {
  const r = radius === undefined ? R : radius;
  const d1 = Math.sqrt(h0 ** 2 + 2 * r * h0);
  if (d <= d1) return { d1, d2: 0, h1: 0 };
  const d2 = d - d1;
  const h1 = Math.sqrt(d2 ** 2 + r ** 2) - r;
  return { d1, d2, h1 };
}

/**
 * Hidden height via the circle-perimeter derivation.
 * @param {number} d - Total observed distance in km.
 * @param {number} [radius] - Earth radius to use (geometric R, or refracted R').
 * @returns {{alpha: number, h1: number}}
 */
function calcDropPerimeter(d, radius) {
  const r = radius === undefined ? R : radius;
  const alpha = d / r;
  const h1 = r * (1 - Math.cos(alpha));
  return { alpha, h1 };
}

/**
 * Hidden height via the trigonometric derivation.
 * @param {number} d - Total observed distance in km.
 * @param {number} [radius] - Earth radius to use (geometric R, or refracted R').
 * @returns {{alpha: number, h1: number}}
 */
function calcDropTrigonometry(d, radius) {
  const r = radius === undefined ? R : radius;
  const alpha = d / r;
  const h1 = r * (1 / Math.cos(alpha) - 1);
  return { alpha, h1 };
}

/** Variables block (symbol + description + live value) shared layout for all three methods. */
function renderVariables(container, rows) {
  const lines = [String.raw`\text{\textbf{Variables}}`, ...rows.map(([sym, desc, val]) =>
    String.raw`${sym}: \text{${desc}} = ${val}`)];
  katex.render(lines.join(String.raw`\\`), container);
}

function renderPythagorasVariablesAndDerivation(h0, d, d1, d2, h1, h1Optical) {
  renderVariables(document.getElementById('formula-variables-pythagoras'), [
    ['d', 'observed distance', `${fmt(d)}\\text{ km}`],
    ['d_1', 'distance to the geometric horizon', `${fmt(d1)}\\text{ km}`],
    ['d_2', 'distance from the horizon to the object', `${fmt(d2)}\\text{ km}`],
    ['h_0', 'observer height', `${fmt(h0)}\\text{ km}`],
    ['h_1', 'hidden height, geometric (drop)', `${fmt(h1)}\\text{ km}`],
    ['h_1^{\\prime}', 'hidden height, optical (refracted)', `${fmt(h1Optical)}\\text{ km}`],
    ['R', 'Earth radius', `${R}\\text{ km}`],
    ['R^{\\prime}', 'refracted Earth radius', `${fmt(R_OPTICAL, 1)}\\text{ km}`],
    ['k', 'standard refraction coefficient', `${fmt(REFRACTION_K, 3)}`],
  ]);

  katex.render(
    String.raw`d_1 = \sqrt{${fmt(h0)}^2 + 2 \cdot ${R} \cdot ${fmt(h0)}} = ${fmt(d1)}\text{ km}`,
    document.getElementById('formula-pythagoras-1-sub'));
  katex.render(
    String.raw`\begin{aligned}` +
    String.raw`d_2 &= ${fmt(d)} - ${fmt(d1)} = ${fmt(d2)}\text{ km}\\` +
    String.raw`h_1 &= \sqrt{${fmt(d2)}^2 + ${R}^2} - ${R} = ${fmt(h1)}\text{ km}` +
    String.raw`\end{aligned}`,
    document.getElementById('formula-pythagoras-2-sub'));
  katex.render(
    String.raw`h_1^{\prime} = \sqrt{${fmt(d2)}^2 + ${fmt(R_OPTICAL, 1)}^2} - ${fmt(R_OPTICAL, 1)} = ${fmt(h1Optical)}\text{ km}`,
    document.getElementById('formula-pythagoras-optical-sub'));
}

function renderPerimeterVariablesAndDerivation(d, alpha, h1, h1Optical) {
  const C = 2 * Math.PI * R;
  renderVariables(document.getElementById('formula-variables-perimeter'), [
    ['C', 'Earth circumference', `${fmt(C, 1)}\\text{ km}`],
    ['d', 'observed distance', `${fmt(d)}\\text{ km}`],
    ['R', 'Earth radius', `${R}\\text{ km}`],
    ['R^{\\prime}', 'refracted Earth radius', `${fmt(R_OPTICAL, 1)}\\text{ km}`],
    ['k', 'standard refraction coefficient', `${fmt(REFRACTION_K, 3)}`],
    ['\\alpha', 'subtended angle', `${fmt(alpha, 5)}\\text{ rad}`],
    ['h_1', 'hidden height, geometric (drop)', `${fmt(h1)}\\text{ km}`],
    ['h_1^{\\prime}', 'hidden height, optical (refracted)', `${fmt(h1Optical)}\\text{ km}`],
  ]);

  katex.render(String.raw`C = 2\pi \cdot ${R} = ${fmt(C, 1)}\text{ km}`,
    document.getElementById('formula-perimeter-1-sub'));
  katex.render(String.raw`\alpha = \dfrac{${fmt(d)}}{${R}} = ${fmt(alpha, 5)}\text{ rad}`,
    document.getElementById('formula-perimeter-2-sub'));
  katex.render(String.raw`h_1 = ${R}(1 - \cos(${fmt(alpha, 5)})) = ${fmt(h1)}\text{ km}`,
    document.getElementById('formula-perimeter-3-sub'));
  katex.render(
    String.raw`h_1^{\prime} = ${fmt(R_OPTICAL, 1)}(1 - \cos(${fmt(d / R_OPTICAL, 5)})) = ${fmt(h1Optical)}\text{ km}`,
    document.getElementById('formula-perimeter-optical-sub'));
}

function renderTrigonometryVariablesAndDerivation(d, alpha, h1, h1Optical) {
  renderVariables(document.getElementById('formula-variables-trigonometry'), [
    ['d', 'observed distance', `${fmt(d)}\\text{ km}`],
    ['R', 'Earth radius', `${R}\\text{ km}`],
    ['R^{\\prime}', 'refracted Earth radius', `${fmt(R_OPTICAL, 1)}\\text{ km}`],
    ['k', 'standard refraction coefficient', `${fmt(REFRACTION_K, 3)}`],
    ['\\alpha', 'subtended angle', `${fmt(alpha, 5)}\\text{ rad}`],
    ['h_1', 'hidden height, geometric (drop)', `${fmt(h1)}\\text{ km}`],
    ['h_1^{\\prime}', 'hidden height, optical (refracted)', `${fmt(h1Optical)}\\text{ km}`],
  ]);

  katex.render(String.raw`\alpha = \dfrac{${fmt(d)}}{${R}} = ${fmt(alpha, 5)}\text{ rad}`,
    document.getElementById('formula-trigonometry-1-sub'));
  katex.render(
    String.raw`h_1 = ${R}\left(\dfrac{1}{\cos(${fmt(alpha, 5)})} - 1\right) = ${fmt(h1)}\text{ km}`,
    document.getElementById('formula-trigonometry-2-sub'));
  katex.render(
    String.raw`h_1^{\prime} = ${fmt(R_OPTICAL, 1)}\left(\dfrac{1}{\cos(${fmt(d / R_OPTICAL, 5)})} - 1\right) = ${fmt(h1Optical)}\text{ km}`,
    document.getElementById('formula-trigonometry-optical-sub'));
}

// ---------------------------------------------------------------------------
// Diagrams — schematic SVGs, not to scale. h0 and h1 are two independent
// quantities (an input height vs. a computed drop that can be 10-50x
// different), so each gets its own log-scaled pixel height rather than
// sharing one curvature constant — sharing one (the earlier approach) blew
// up whichever side was geometrically farther from the horizon, since a
// shared parabola scales with the *square* of horizontal distance.
// ---------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';
const PLOT_X0 = 50, PLOT_X1 = 570, DIAGRAM_H = 190;
const SIGHT_Y = 60;
const MIN_DROP_PX = 5, MAX_DROP_PX = 95, DROP_REF_KM = 300;

/** Map a real km value to a legible pixel drop, log-compressed so both tiny
 *  (0.01 km) and huge (100s of km) values stay visible without either
 *  vanishing or blowing past the diagram. */
function dropPx(km) {
  const v = Math.max(0, km);
  if (v < 1e-6) return 0;
  const t = Math.min(1, Math.log1p(v) / Math.log1p(DROP_REF_KM));
  return MIN_DROP_PX + (MAX_DROP_PX - MIN_DROP_PX) * t;
}

function svgEl(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}

function diagramArrowMarker(id) {
  const marker = svgEl('marker', {
    id, viewBox: '0 0 10 10', refX: '5', refY: '5',
    markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse',
  });
  marker.appendChild(svgEl('path', { d: 'M0,0 L10,5 L0,10 Z', class: 'diagram-arrowhead' }));
  return marker;
}

function doubleArrow(markerId, x1, y1, x2, y2) {
  return svgEl('line', {
    class: 'diagram-arrow', x1, y1, x2, y2,
    'marker-start': `url(#${markerId})`, 'marker-end': `url(#${markerId})`,
  });
}

function diagramLabel(x, y, label, anchor) {
  const el = svgEl('text', { class: 'diagram-label', x, y, 'text-anchor': anchor || 'middle' });
  el.textContent = label;
  return el;
}

function diagramDot(x, y) {
  return svgEl('circle', { class: 'diagram-point', cx: x, cy: y, r: 3 });
}

/**
 * Build a smooth surface curve tangent to the sight line at xHorizon, with
 * independent curvature on each side so the left drop (at xLeft) and right
 * drop (at xRight) each land exactly on their own pixel height, regardless
 * of how far xLeft/xRight are from xHorizon.
 */
function curvePolyline(xLeft, leftDropPx, xHorizon, xRight, rightDropPx) {
  const steps = 24;
  const pts = [];
  const distLeft = Math.max(Math.abs(xHorizon - xLeft), 1);
  const distRight = Math.max(Math.abs(xRight - xHorizon), 1);
  const kLeft = leftDropPx / distLeft ** 2;
  const kRight = rightDropPx / distRight ** 2;
  for (let i = 0; i <= steps; i++) {
    const x = xLeft + (xRight - xLeft) * (i / steps);
    const k = x <= xHorizon ? kLeft : kRight;
    const y = SIGHT_Y + k * (x - xHorizon) ** 2;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return svgEl('polyline', { class: 'diagram-surface', points: pts.join(' ') });
}

/** Diagram for the Pythagorean method: observer + h0, horizon split into d1/d2, target + h1. */
function renderPythagorasDiagram(container, h0, d) {
  const h0v = Number.isFinite(h0) && h0 > 0 ? h0 : 0;
  const dv = Number.isFinite(d) && d > 0 ? d : 0;
  const { d1, h1 } = calcDropPythagoras(h0v, dv);
  const hasHidden = dv > d1 + 1e-4;

  const dTotal = Math.max(dv, d1, 1);
  const pxPerKm = (PLOT_X1 - PLOT_X0) / dTotal;
  const xEye = PLOT_X0;
  const xHorizon = Math.min(PLOT_X0 + d1 * pxPerKm, PLOT_X1 - 4);
  const xTarget = Math.min(Math.max(PLOT_X0 + dv * pxPerKm, PLOT_X0), PLOT_X1);
  const curveRightEnd = hasHidden ? xTarget : PLOT_X1;

  const groundDrop = dropPx(h0v);
  const targetDrop = hasHidden ? dropPx(h1) : 0;
  const groundY = SIGHT_Y + groundDrop;

  const arrowId = 'arrow-pythagoras';
  const svg = svgEl('svg', { viewBox: `0 0 620 ${DIAGRAM_H}`, class: 'diagram-svg' });
  const defs = svgEl('defs', {});
  defs.appendChild(diagramArrowMarker(arrowId));
  svg.appendChild(defs);

  svg.appendChild(curvePolyline(xEye, groundDrop, xHorizon, curveRightEnd, targetDrop));
  svg.appendChild(svgEl('line', { class: 'diagram-sight', x1: xEye, y1: SIGHT_Y, x2: curveRightEnd, y2: SIGHT_Y }));

  // h0 (eye above ground)
  if (h0v > 0.02) {
    svg.appendChild(doubleArrow(arrowId, xEye, SIGHT_Y, xEye, groundY));
    svg.appendChild(diagramLabel(xEye - 10, (SIGHT_Y + groundY) / 2 + 4, 'h₀', 'end'));
  }
  svg.appendChild(diagramDot(xEye, groundY));
  svg.appendChild(diagramDot(xHorizon, SIGHT_Y));

  // d1 / d2 split (below the curve)
  const splitY = DIAGRAM_H - 22;
  svg.appendChild(doubleArrow(arrowId, xEye, splitY, xHorizon, splitY));
  svg.appendChild(diagramLabel((xEye + xHorizon) / 2, splitY - 6, 'd₁'));
  if (hasHidden) {
    svg.appendChild(doubleArrow(arrowId, xHorizon, splitY, xTarget, splitY));
    svg.appendChild(diagramLabel((xHorizon + xTarget) / 2, splitY - 6, 'd₂'));
  }

  // d (total, top)
  svg.appendChild(doubleArrow(arrowId, xEye, 16, xTarget, 16));
  svg.appendChild(diagramLabel((xEye + xTarget) / 2, 12, 'd'));

  // h1 (target hidden height)
  const targetDotY = SIGHT_Y + (hasHidden ? targetDrop : 0);
  if (hasHidden) {
    svg.appendChild(doubleArrow(arrowId, xTarget, SIGHT_Y, xTarget, targetDotY));
    svg.appendChild(diagramLabel(xTarget + 10, (SIGHT_Y + targetDotY) / 2 + 4, 'h₁', 'start'));
  }
  svg.appendChild(diagramDot(xTarget, targetDotY));

  container.replaceChildren(svg);
}

/** Shared diagram for the circle-perimeter and trigonometric methods: d and h1 only. */
function renderArcDiagram(container, d, h1) {
  const dv = Number.isFinite(d) && d > 0 ? d : 0;
  const xObserver = PLOT_X0;
  const xHorizon = PLOT_X0 + 0.35 * (PLOT_X1 - PLOT_X0);
  const xTarget = PLOT_X1;
  const targetDrop = dropPx(h1);
  const targetY = SIGHT_Y + targetDrop;

  const arrowId = 'arrow-arc';
  const svg = svgEl('svg', { viewBox: `0 0 620 ${DIAGRAM_H}`, class: 'diagram-svg' });
  const defs = svgEl('defs', {});
  defs.appendChild(diagramArrowMarker(arrowId));
  svg.appendChild(defs);

  svg.appendChild(curvePolyline(xObserver, 0, xHorizon, xTarget, targetDrop));
  svg.appendChild(svgEl('line', { class: 'diagram-sight', x1: xObserver, y1: SIGHT_Y, x2: xTarget, y2: SIGHT_Y }));
  svg.appendChild(diagramDot(xObserver, SIGHT_Y));
  svg.appendChild(diagramDot(xHorizon, SIGHT_Y));

  svg.appendChild(doubleArrow(arrowId, xObserver, 16, xTarget, 16));
  svg.appendChild(diagramLabel((xObserver + xTarget) / 2, 12, dv > 0 ? 'd' : ''));

  svg.appendChild(doubleArrow(arrowId, xTarget, SIGHT_Y, xTarget, targetY));
  svg.appendChild(diagramLabel(xTarget + 10, (SIGHT_Y + targetY) / 2 + 4, 'h₁', 'start'));
  svg.appendChild(diagramDot(xTarget, targetY));

  container.replaceChildren(svg);
}

function showMethod(method) {
  document.querySelectorAll('.method').forEach((section) => {
    section.hidden = section.dataset.method !== method;
  });
  document.querySelectorAll('.method-tabs button').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.method === method));
  });
}

/** Clamp a number input live: at most `maxDigits` integer digits, and a hard ceiling. */
function clampNumberInput(input, maxDigits, ceiling) {
  input.addEventListener('input', () => {
    if (maxDigits && input.value.length > maxDigits && !input.value.includes('.')) {
      input.value = input.value.slice(0, maxDigits);
    }
    if (parseFloat(input.value) > ceiling) input.value = String(ceiling);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderStaticFormulas();

  document.querySelectorAll('.method-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => showMethod(btn.dataset.method));
  });

  const diagramPythagoras = document.getElementById('diagram-pythagoras');
  const diagramPerimeter = document.getElementById('diagram-perimeter');
  const diagramTrigonometry = document.getElementById('diagram-trigonometry');

  const h0Input = document.getElementById('h0');
  const dPythagorasInput = document.getElementById('d-pythagoras');
  const h1Pythagoras = document.getElementById('h1-pythagoras');
  const h1PythagorasOptical = document.getElementById('h1-pythagoras-optical');
  clampNumberInput(h0Input, 2, 20);
  clampNumberInput(dPythagorasInput, null, 2000);
  const updatePythagoras = () => {
    const h0 = parseFloat(h0Input.value);
    const d = parseFloat(dPythagorasInput.value);
    const valid = Number.isFinite(h0) && Number.isFinite(d);
    const { d1, d2, h1 } = valid ? calcDropPythagoras(h0, d) : { d1: NaN, d2: NaN, h1: NaN };
    const h1Optical = valid ? calcDropPythagoras(h0, d, R_OPTICAL).h1 : NaN;
    h1Pythagoras.value = valid ? fmt(h1) : '';
    h1PythagorasOptical.value = valid ? fmt(h1Optical) : '';
    renderPythagorasDiagram(diagramPythagoras, h0, d);
    renderPythagorasVariablesAndDerivation(h0, d, d1, d2, h1, h1Optical);
  };
  h0Input.addEventListener('input', updatePythagoras);
  dPythagorasInput.addEventListener('input', updatePythagoras);

  const dPerimeterInput = document.getElementById('d-perimeter');
  const h1Perimeter = document.getElementById('h1-perimeter');
  const h1PerimeterOptical = document.getElementById('h1-perimeter-optical');
  clampNumberInput(dPerimeterInput, null, 2000);
  const updatePerimeter = () => {
    const d = parseFloat(dPerimeterInput.value);
    const valid = Number.isFinite(d);
    const { alpha, h1 } = valid ? calcDropPerimeter(d) : { alpha: NaN, h1: NaN };
    const h1Optical = valid ? calcDropPerimeter(d, R_OPTICAL).h1 : NaN;
    h1Perimeter.value = valid ? fmt(h1) : '';
    h1PerimeterOptical.value = valid ? fmt(h1Optical) : '';
    renderArcDiagram(diagramPerimeter, d, valid ? h1 : 0);
    renderPerimeterVariablesAndDerivation(d, alpha, h1, h1Optical);
  };
  dPerimeterInput.addEventListener('input', updatePerimeter);

  const dTrigonometryInput = document.getElementById('d-trigonometry');
  const h1Trigonometry = document.getElementById('h1-trigonometry');
  const h1TrigonometryOptical = document.getElementById('h1-trigonometry-optical');
  clampNumberInput(dTrigonometryInput, null, 2000);
  const updateTrigonometry = () => {
    const d = parseFloat(dTrigonometryInput.value);
    const valid = Number.isFinite(d);
    const { alpha, h1 } = valid ? calcDropTrigonometry(d) : { alpha: NaN, h1: NaN };
    const h1Optical = valid ? calcDropTrigonometry(d, R_OPTICAL).h1 : NaN;
    h1Trigonometry.value = valid ? fmt(h1) : '';
    h1TrigonometryOptical.value = valid ? fmt(h1Optical) : '';
    renderArcDiagram(diagramTrigonometry, d, valid ? h1 : 0);
    renderTrigonometryVariablesAndDerivation(d, alpha, h1, h1Optical);
  };
  dTrigonometryInput.addEventListener('input', updateTrigonometry);

  // Inputs are pre-seeded with example values (see HTML), so run once to populate
  // the result, diagram, variables and substituted derivation from the start.
  updatePythagoras();
  updatePerimeter();
  updateTrigonometry();
});
