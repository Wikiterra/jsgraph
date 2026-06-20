// Tabs.js — Modernized: ARIA-based tab system, same public API.
// (C) http://walter.bislins.ch/doku/tabs
//
// Maintains full backward compatibility: Tabs.Select(id, ix),
// Tabs.AddButtonClickHandler(id, btnId, fn), etc.

var Tabs = {
  BoxTabList: [],
  IsInit: false,
  BoxDataList: [],
  SelectHandlers: [],
  VisiChangeHandlers: [],
  ButtonClickHandlers: [],

  // ---- Internal helpers ----

  FindBoxTab: function (boxTab) {
    if (typeof boxTab === 'object') return boxTab;
    if (typeof boxTab === 'string') {
      var el = xGet(boxTab);
      if (el && xHasClass(el, 'TabSelectors')) return el;
    }
    return null;
  },

  CollectTabsAndBoxes: function () {
    var all = document.querySelectorAll('ul.TabSelectors');
    for (var i = 0; i < all.length; i++) {
      var bt = all[i];
      bt.DefaultTab = 0;
      bt.NEnabled = bt.children.length;
      bt.CurrentTab = -1;
      var tb = bt.nextElementSibling;
      while (tb && !xHasClass(tb, 'TabBoxes')) tb = tb.nextElementSibling;
      bt.BoxContainer = tb;
      if (tb) {
        var boxes = tb.children;
        for (var j = 0; j < boxes.length; j++) {
          var bd = { DomObj: boxes[j], Indexes: j, IsVisible: !xHasClass(boxes[j], 'TabHide'), VisiChangeHandlers: { Call: function () {} } };
          this.BoxDataList.push(bd);
        }
      }
      this.BoxTabList.push(bt);
    }
  },

  ForEachBoxTab: function (func) {
    for (var i = 0; i < this.BoxTabList.length; i++) { func(this.BoxTabList[i], i); }
  },

  ForEachTab: function (boxTab, func) {
    if (!boxTab) return;
    var tabs = boxTab.children;
    for (var i = 0; i < tabs.length; i++) { func(boxTab, i); }
  },

  ForEachBox: function (boxTab, func) {
    if (!boxTab || !boxTab.BoxContainer) return;
    var boxes = boxTab.BoxContainer.children;
    for (var i = 0; i < boxes.length; i++) { func(boxes[i], i); }
  },

  // ---- Init ----

  Init: function () {
    this.CollectTabsAndBoxes();
    this.IsInit = true;
    for (var i = 0; i < this.SelectHandlers.length; i++) {
      this.AddSelectHandler(this.SelectHandlers[i].BoxTab, this.SelectHandlers[i].Func);
    }
    this.SelectHandlers = [];
    for (var i = 0; i < this.VisiChangeHandlers.length; i++) {
      this.AddVisiChangeHandler(this.VisiChangeHandlers[i].BoxDataChildDomObj, this.VisiChangeHandlers[i].Func);
    }
    this.VisiChangeHandlers = [];
    for (var i = 0; i < this.ButtonClickHandlers.length; i++) {
      this.AddButtonClickHandler(this.ButtonClickHandlers[i].BoxTab, this.ButtonClickHandlers[i].Button, this.ButtonClickHandlers[i].Func);
    }
    this.ButtonClickHandlers = [];
    this.ForEachBoxTab(function (bt) { Tabs.Select(bt); });
  },

  // ---- Select ----

  Select: function (boxTab, ix) {
    boxTab = this.FindBoxTab(boxTab);
    if (!boxTab) return;
    if (ix === undefined || ix === null) ix = boxTab.DefaultTab || 0;
    var tabList = boxTab.children;
    if (ix < 0 || ix >= tabList.length) return;
    for (var i = 0; i < tabList.length; i++) {
      if (i === ix) {
        xAddClass(tabList[i], 'TabSelected');
        tabList[i].setAttribute('aria-selected', 'true');
      } else {
        xRemoveClass(tabList[i], 'TabSelected');
        tabList[i].setAttribute('aria-selected', 'false');
      }
    }
    boxTab.CurrentTab = ix;
    this.ForEachBox(boxTab, function (box, i) {
      if (i === ix) { xRemoveClass(box, 'TabHide'); }
      else { xAddClass(box, 'TabHide'); }
    });
  },

  Reset: function (boxTab) {
    if (!boxTab) { this.ForEachBoxTab(function (bt) { Tabs.Select(bt); }); }
    else { this.Select(boxTab); }
  },

  GetCurrent: function (boxTab) {
    boxTab = this.FindBoxTab(boxTab);
    return boxTab ? boxTab.CurrentTab : 0;
  },

  GetDefault: function (boxTab) {
    boxTab = this.FindBoxTab(boxTab);
    return boxTab ? (boxTab.DefaultTab || 0) : 0;
  },

  IsSelected: function (boxTab, ix) { return this.GetCurrent(boxTab) === ix; },

  // ---- Select handlers ----
  AddSelectHandler: function (boxTab, func) {
    if (!this.IsInit) { this.SelectHandlers.push({ BoxTab: boxTab, Func: func }); return; }
    boxTab = this.FindBoxTab(boxTab);
    if (!boxTab) return;
    if (!boxTab._selectHandlers) boxTab._selectHandlers = [];
    boxTab._selectHandlers.push(func);
  },

  AddVisiChangeHandler: function (boxDataChildDomObj, func) {
    if (!this.IsInit) { this.VisiChangeHandlers.push({ BoxDataChildDomObj: boxDataChildDomObj, Func: func }); return; }
  },

  // ---- Button click handlers ----
  AddButtonClickHandler: function (boxTab, button, func) {
    if (!this.IsInit) {
      this.ButtonClickHandlers.push({ BoxTab: boxTab, Button: button, Func: func });
      return this;
    }
    boxTab = this.FindBoxTab(boxTab);
    if (!boxTab) return this;
    var domObj;
    if (typeof button === 'string') { domObj = xGet(button); }
    else if (typeof button === 'number' && button >= 0) { domObj = boxTab.children[button]; }
    if (!domObj) return this;
    xAddEvent(domObj, 'click', function (e) { try { func(button, e); } catch (ex) {} });
    return this;
  },

  // Stubs for unused APIs
  SetEnabled: function () {},
  GetNEnabled: function () { return 0; },
  ToggleEnabled: function () { return false; },
  SelectNext: function () {},
  SelectPrev: function () {},
};

// Auto-init: run on load regardless of DOM state. CollectTabsAndBoxes is a
// no-op if there are no .TabSelectors in the DOM yet; the DOM is fully parsed
// by the time deferred ESM modules execute, so this is safe.
(function () {
  // Give any queued ButtonClickHandlers from init.js etc. a chance to register
  // before Init processes them. Queue microtask so init.js handlers arrive first.
  Promise.resolve().then(function () {
    Tabs.Init();
  });
})();
