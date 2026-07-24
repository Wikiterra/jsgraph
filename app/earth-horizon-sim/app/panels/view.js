// View panel (Pan/Tilt). Height/Zoom f/View∠ live in basics.js's BasicsPanel
// (panel-basics) — not duplicated here.

ControlPanels.NewSliderPanel( {
  ModelRef: 'CurveApp',
  OnModelChange: UpdateAll,
  Format: 'fix',
  Digits: DefaultDigits,
  ReadOnly: false,
  PanelFormat: 'InputMediumWidth'

} ).AddValueSliderField( {
  Name: 'Pan',
  ValueRef: 'Pan',
  SliderValueRef: 'PanSlider',
  Format: 'fix',
  Digits: 2,
  Units: '°',
  Color: 'green',
  Min: -1,
  Max: 1,
  Inc: 0.1,

} ).AddValueSliderField( {
  Name: 'Tilt',
  ValueRef: 'Tilt',
  SliderValueRef: 'TiltSlider',
  Format: 'fix',
  Digits: 2,
  Units: '°',
  Color: 'green',
  Min: -1,
  Max: 1,
  Inc: 0.1,

} ).RenderInto('panel-view');
