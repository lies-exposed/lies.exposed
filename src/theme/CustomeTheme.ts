import {
  createTheme,
  lightThemePrimitives,
  createThemedUseStyletron,
} from "baseui"
import { ThemePrimitives } from "baseui/theme"
import { createGlobalStyle } from "styled-components"
// eslint-disable-next-line no-restricted-imports
import "../scss/main.scss"

export const customColors = {
  brandPrimary: "#ff4e50",
  brandSecondary: "#00CC66",
  red: "#ff4e50",
  yellow: "#f9d62e",
  black: "#141618",
  secondaryBlack: "#eae374",
  primaryDark: "#3E4348",
  secondaryGray: "#7F8893",
  tertiaryGray: "#C4CBD5",
  primaryLight: "#E6E9EF",
  secondaryLight: "#F7F8FB",
  white: "#FFFFFF",
  brandPrimaryTint: {
    20: "#3775DC",
    40: "#6997E5",
    60: "#9BBAED",
    80: "#CDDCF6",
  },
  brandPrimaryTintDark: {
    20: "#0442A9",
    40: "#03317F",
    60: "#022154",
    80: "#01102A",
  },
  brandSecondaryTint: {
    20: "#33D685",
    40: "#66E0A3",
    60: "#99EBC2",
    80: "#CCF5E0",
  },
}

export const GlobalStyle = createGlobalStyle`

  html {
    font-family: 'Source Serif Pro';
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 24px;
    color: ${customColors.primaryDark};

    caret-color: red;
  }
`

const primitives: ThemePrimitives = {
  ...lightThemePrimitives,
  primaryFontFamily: "Source Serif Pro",
}

const overrides = {
  customColors,
  colors: {
    /* Radio / Checkbox */
    tickFill: customColors.white,
    tickFillHover: customColors.white,
    tickFillActive: customColors.white,
    tickFillSelected: customColors.brandPrimary,
    tickFillSelectedHover: customColors.brandPrimary,
    tickFillSelectedHoverActive: customColors.brandPrimary,
    tickFillError: customColors.white,
    tickFillErrorHover: customColors.white,
    tickFillErrorHoverActive: customColors.white,
    tickFillErrorSelected: customColors.red,
    tickFillErrorSelectedHover: customColors.red,
    tickFillErrorSelectedHoverActive: customColors.white,
    tickFillDisabled: customColors.primaryLight,
    tickBorder: customColors.tertiaryGray,
    tickBorderError: customColors.red,
    tickMarkFill: customColors.white,
    tickMarkFillError: customColors.white,
    tickMarkFillDisabled: customColors.tertiaryGray,
    /* Button */
    buttonPrimaryFill: customColors.brandPrimary,
    buttonPrimaryHover: customColors.brandPrimaryTint[20],
    buttonPrimaryActive: customColors.brandPrimaryTintDark[40],
    buttonDisabledFill: customColors.primaryLight,
    buttonDisabledText: customColors.tertiaryGray,

    buttonSecondaryFill: customColors.white,
    buttonSecondaryText: customColors.brandPrimary,
    buttonSecondaryHover: customColors.brandPrimaryTint[80],
    buttonSecondaryActive: customColors.brandPrimaryTint[60],

    /* Input */
    inputFill: "transparent",
    inputFillError: customColors.white,
    inputFillActive: customColors.white,
    inputTextDisabled: customColors.secondaryLight,
  },
  typography: {
    secondaryFont: "Verdana",
    thirdaryFont: '"Lucida Console", Monaco, monospace',
  },
}

export const theme = createTheme(primitives, overrides)

export type CustomTheme = typeof theme

export interface CustomOverrides {
  $theme: CustomTheme
  [k: string]: any
}

export const themedUseStyletron = createThemedUseStyletron<CustomTheme>()

export default theme
