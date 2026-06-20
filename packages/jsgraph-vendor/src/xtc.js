// xtc.js — Modernized: replaced IE legacy code with standard DOM APIs.
// (C) http://walter.bislins.ch/doku/xtc
//
// Original was a cross-browser text-control wrapper (IE's document.selection vs
// standard selectionStart/End). Only the modern path is kept since IE is defunct.
// This file is still loaded for backward compatibility; no app code invokes
// xTextControl directly.

function xNormString(aStr) { return aStr.replace(/\r\n/g, '\n'); }

function xTextControl(aTextControl) {
  this.TextControl = aTextControl;
  this.SelStart = 0;
  this.SelEnd = 0;
  this.SelText = '';
  this.Text = '';
  this.Enabled = this.GetDataFromControl();
}
xTextControl.prototype.GetDataFromControl = function () {
  if (!this.TextControl) return false;
  this.Text = xNormString(this.TextControl.value);
  if (this.TextControl.setSelectionRange) {
    this.SelStart = this.TextControl.selectionStart;
    this.SelEnd = this.TextControl.selectionEnd;
    this.SelText = this.Text.substring(this.SelStart, this.SelEnd);
    return true;
  }
  return false;
};
xTextControl.prototype.GetScrollTop = function () {
  return typeof this.TextControl?.scrollTop === 'number' ? this.TextControl.scrollTop : 0;
};
xTextControl.prototype.SetScrollTop = function (aTop) {
  if (typeof this.TextControl?.scrollTop === 'number') this.TextControl.scrollTop = aTop;
};
xTextControl.prototype.SetText = function (aText) {
  if (this.TextControl) {
    var st = this.TextControl.scrollTop;
    this.TextControl.value = aText;
    this.TextControl.scrollTop = st;
    this.Text = aText;
  }
};
xTextControl.prototype.ChangeSelection = function (aSelStart, aSelEnd, aReplaceText, aUpdateControlSelection) {
  var preText = this.Text.substring(0, aSelStart);
  var pstText = this.Text.substring(aSelEnd);
  this.SetText(preText + aReplaceText + pstText);
  this.SelStart = aSelStart;
  this.SelEnd = aSelStart + aReplaceText.length;
  this.SelText = aReplaceText;
  if (aUpdateControlSelection) this.UpdateControlSelection();
};
xTextControl.prototype.SetSelectionRange = function (aSelStart, aSelEnd, aUpdateControlSelection) {
  this.SelStart = aSelStart;
  this.SelEnd = aSelEnd;
  this.SelText = this.Text.substring(aSelStart, aSelEnd);
  if (aUpdateControlSelection) this.UpdateControlSelection();
};
xTextControl.prototype.ChangeSelectionText = function (aReplaceText, aUpdateControlSelection) {
  this.ChangeSelection(this.SelStart, this.SelEnd, aReplaceText, aUpdateControlSelection);
};
xTextControl.prototype.SetCaretPos = function (aPos) { this.SetSelectionRange(aPos, aPos, true); };
xTextControl.prototype.UpdateControlSelection = function () {
  if (!this.TextControl) return;
  this.TextControl.focus();
  if (this.TextControl.setSelectionRange) {
    this.TextControl.setSelectionRange(this.SelStart, this.SelEnd);
  }
};

Object.assign(globalThis, { xNormString, xTextControl });
