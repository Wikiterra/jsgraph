/**
 * ui.js — orchestrator
 *
 * Wraps the legacy UpdateAll so every model change re-syncs the UI, then
 * delegates to focused modules in js/ui/.
 */
import * as layers from './ui/layers.js';
import * as sliders from './ui/sliders.js';
import * as sunmoon from './ui/sunmoon.js';
import * as calendar from './ui/calendar.js';
import * as playback from './ui/playback.js';
import * as saveRestore from './ui/save-restore.js';
import {
  gridIcon, domeIcon, shadowIcon, sunIcon, moonIcon, starsIcon, orbitsIcon,
  moveIcon, domeRaysIcon, sphereRaysIcon, stepBackIcon, stepFwdIcon, resetIcon,
} from 'jsgraph-vendor/src/core/icons.js';

const MODULES = [layers, sliders, sunmoon, calendar, playback, saveRestore];

/* Replace the inline button SVGs with the shared icon library. Each button keeps
   its <span class="toggle-label">; only the <svg> is swapped. #pb-play is left
   alone — playback.js drives its inner path by id (#pb-play-icon). */
const BAR_ICONS = [
  ['[data-prop="ShowFeGrid"]', gridIcon],
  ['[data-prop="ShowDomeGrid"]', domeIcon],
  ['[data-prop="ShowShadow"]', shadowIcon],
  ['[data-prop="ShowSphere"]', domeIcon],
  ['[data-prop="ShowSun"]', sunIcon],
  ['[data-prop="ShowMoon"]', moonIcon],
  ['[data-prop="ShowStars"]', starsIcon],
  ['[data-prop-list="ShowSunTrack,ShowMoonTrack"]', orbitsIcon],
  ['#move-observer-btn', moveIcon],
  ['[data-prop="ShowDomeRays"]', domeRaysIcon],
  ['[data-prop-list="ShowSphereRays,ShowManyRays"]', sphereRaysIcon],
];
const PB_ICONS = [
  ['#pb-step-back', stepBackIcon],
  ['#pb-step-fwd', stepFwdIcon],
  ['#pb-reset', resetIcon],
];

function applyIcons() {
  const swap = (sel, fn, size) => {
    const btn = document.querySelector(sel);
    const svg = btn && btn.querySelector('svg');
    if (svg) svg.outerHTML = fn({ width: size, height: size });
  };
  for (const [sel, fn] of BAR_ICONS) swap(sel, fn, 18);
  for (const [sel, fn] of PB_ICONS) swap(sel, fn, 14);
}

const origUpdateAll = window.UpdateAll;
window.UpdateAll = function () {
  origUpdateAll.apply(this, arguments);
  for (const m of MODULES) m.sync();
};

function init() {
  applyIcons();

  for (const m of MODULES) {
    m.sync();
    m.init();
  }

  /* ── One-shot wirings that don't belong to a single concern ────────────── */

  /* Canvas fills its container height (no 56%-of-width letterbox gap below).
     CanvasRatioHW == 0 makes jsg size the canvas to the container instead of a
     fixed aspect ratio (see UpdateCanvasSize in jsg.js). */
  try {
    const g = FeDomeApp.GraphObject;
    if (g) {
      g.CanvasRatioHW = 0;
      if (g.UpdateCanvasSize) g.UpdateCanvasSize();
      if (g.Redraw) g.Redraw();
    }
  } catch (e) { }

  /* ResizeObserver: accelerate jsg's 50 ms resize poll */
  if (window.ResizeObserver) {
    try {
      const g = FeDomeApp.GraphObject;
      if (g && g.ContainerDiv) {
        new ResizeObserver(() => g.CheckResizeRegularly && g.CheckResizeRegularly())
          .observe(g.ContainerDiv);
      }
    } catch (e) { }
  }

  /* Screenshot export */
  const screenshotBtn = document.getElementById('btn-screenshot');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', screenshotHandler);
  }

  /* Reset button (hidden demo-tab stub, kept for click wiring) */
  document.getElementById('ResetButton')?.addEventListener('click', () => { if (window.ResetApp) ResetApp(); });

  function screenshotHandler() {
    try {
      const canvas = FeDomeApp.GraphObject && FeDomeApp.GraphObject.Canvas;
      if (!canvas) return;
      const a = document.createElement('a');
      let dateStr = '';
      try { dateStr = '-' + FeDomeApp.DateTimeToString(FeDomeApp.DateTime).split('|')[0].trim().replace(/[^\w]/g, '-'); } catch (e) { }
      a.download = 'fed' + dateStr + '.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (e) { alert('Screenshot failed: ' + e.message); }
  }

  /* Gesture hint fade-out */
  const gestureHint = document.getElementById('gesture-hint');
  if (gestureHint) {
    setTimeout(() => {
      gestureHint.style.opacity = '0';
      setTimeout(() => { gestureHint.hidden = true; }, 950);
    }, 5000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
