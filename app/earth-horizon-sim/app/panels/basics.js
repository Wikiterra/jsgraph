// Basics + Options panel (Globe/FE, slider Height/Distance/Size/Refraction/Zoom/View)

ControlPanels.NewSliderPanel( {
  Name: 'BasicsPanel',
  ModelRef: 'CurveApp',
  OnModelChange: UpdateAll,
  Format: 'fix',
  Digits: DefaultDigits,
  ReadOnly: false,
  PanelFormat: 'InputMediumWidth'

} ).AddValueSliderField( {
  Name: 'Height',
  Label: 'Observer Height',
  ValueRef: 'Height',
  SliderValueRef: 'HeightSlider',
  UnitsData: 'HeightUnits',
  Color: 'blue',
  // 3 decimals (not the panel default 2): in km, a 2 m eye height rounds to
  // 0.00 at 2 decimals — invisible and unreachable by typing. 3 decimals
  // keeps metre-scale heights legible while staying in km.
  Digits: 3,
  Min: 0,
  Max: 1,
  Inc: 0.1,

} ).AddValueSliderField( {
  Name: 'Refraction',
  ValueRef: 'RefractionCoeff',
  SliderValueRef: 'RefractionSlider',
  Color: 'red',
  Min: -1,
  Max: 1,
  Inc: 0.01,

} ).AddValueSliderField( {
  Name: 'FocalLength',
  ValueRef: 'FocalLengthField',
  SliderValueRef: 'FocalLengthSlider',
  Label: 'Zoom f',
  Units: 'mm',
  Color: 'black',
  Min: 0,
  Max: 1,
  Inc: 1,

} ).AddValueSliderField( {
  Name: 'ViewAngle',
  Label: 'View&ang;',
  ValueRef: 'ViewAngleField',
  SliderValueRef: 'ViewAngleSlider',
  Units: '°',
  Color: 'black',
  Min: 0.247517,
  Max: 91.6,
  Inc: 0.1,

} ).RenderInto('panel-basics');

/* Show Data — which read-only data fields to display. Model lives in the
   bottom bar (Flat / Globe / Both); the view is always eye-level anchored
   (flat's horizon stays at eye level, the globe's horizon drops as observer
   height grows) so there's no separate camera-aim choice to make. Rendered
   into the Data drawer section, next to the data it toggles. */
ControlPanels.NewPanel( {
  Name: 'ShowDataPanel',
  ModelRef: 'CurveApp',
  NCols: 2,
  OnModelChange: UpdateAll

} ).AddCheckboxField( {
  Name: 'ShowData',
  Label: 'Show Data',
  ColSpan: 3,
  Items: [
    {
      Name: 'ShowDataObject',
      Text: 'Object',
    }, {
      Name: 'ShowDataRefraction',
      Text: 'Refr.',
    }, {
      Name: 'ShowDataHorizon',
      Text: 'Horizon',
    }, {
      Name: 'ShowLftRghtDrop',
      Text: 'Left-Right Drop',
    }
  ]

} ).RenderInto('panel-showdata');
