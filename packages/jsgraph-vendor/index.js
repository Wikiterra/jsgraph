// jsgraph-vendor — single canonical copy of the wabis framework (© Walter Bislins,
// http://walter.bislins.ch). Vendored AS-IS; never refactored internally.
//
// This barrel loads the whole framework in dependency order for its side effects.
// Each module also assigns its exports to globalThis, so legacy app code that calls
// the globals (NewGraphX3D, JsgVect3, ...) keeps working.
//
// Apps that need a specific load order interleaved with their own modules can also
// deep-import individual files, e.g. `import "jsgraph-vendor/src/jsg.js"`.
//
// See RECONCILIATION.md for why these versions were chosen as canonical.

import "./src/wiki.js";
import "./src/xtc.js";
import "./src/jsg.js";
import "./src/jsgx3d.js";
import "./src/DataX.js";
import "./src/ModelAnimation.js";
