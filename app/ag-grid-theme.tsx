// ag-grid-theme.ts
import {
  themeQuartz,
  colorSchemeDarkWarm,
  Theme,
} from 'ag-grid-community';
  
const baseDark = themeQuartz.withPart(colorSchemeDarkWarm);
  
export const darkGreenTheme: Theme = baseDark.withParams({
  accentColor:                 '#006400',            // dark green
  headerBackgroundColor:       '#004b23',            // header
  headerTextColor:             '#e6f2e6',            // header text
  chromeBackgroundColor:       'transparent',        // grid backdrop
  backgroundColor:             'transparent',
  textColor:                   '#f0f0e8',            // cell text
  borderColor:                 '#004b23',            // grid lines

  // rows
  oddRowBackgroundColor:       'rgba(0,100,0,0.05)',
  selectedRowBackgroundColor:  'rgba(0,100,0,0.2)',
  tabHoverBackgroundColor:     { ref: 'accentColor', mix: 0.15 },

  // side panels
  panelBackgroundColor:        '#004b23',

  // all pop-ups & floating filters
  menuBackgroundColor:         '#004b23',
  menuSeparatorColor:          '#006400',

  // filter inputs & dropdowns
  inputBackgroundColor:            '#002a10',
});
