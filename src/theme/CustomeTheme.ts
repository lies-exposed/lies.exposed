import {
  createTheme,
  LightTheme,
  lightThemePrimitives,
  createThemedUseStyletron,
} from "baseui"
import { ThemePrimitives, Theme } from "baseui/theme"
import { createGlobalStyle } from "styled-components"
// eslint-disable-next-line no-restricted-imports
import "../scss/main.scss"
// eslint-disable-next-line no-restricted-imports
import "../scss/gatsby-image.scss"

export const customColors = {
  brandPrimary: "#ff4e50",
  brandSecondary: "#00CC66",
  red: "#ff4e50",
  yellow: "#f9d62e",
  black: "#141618",
  secondaryBlack: "#333333",
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

`

const primaryFontFamily = "Source Serif Pro"
const secondaryFontFamily = "Verdana"
const thirdaryFontFamily = '"Lucida Console", Monaco, monospace'

const primitives: ThemePrimitives = {
  ...lightThemePrimitives,
  primaryFontFamily,
}

const headerFont = {
  fontFamily: secondaryFontFamily,
  fontWeight: 800,
  lineHeight: 1.6,
}

const typography = {
  secondaryFont: secondaryFontFamily,
  thirdaryFont: thirdaryFontFamily,
}

interface Overrides {
  colors: Partial<Theme["colors"]> & typeof customColors
  typography: Partial<Theme["typography"]> & typeof typography
}

const overrides: Overrides = {
  colors: {
    ...customColors,
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
    ...typography,
    DisplayMedium: {
      fontFamily: primaryFontFamily,
      fontWeight: 300,
      fontSize: "16px",
      lineHeight: "1.6",
    },
    HeadingXSmall: {
      ...headerFont,
      fontSize: LightTheme.typography.HeadingXSmall.fontSize,
    },
    HeadingSmall: {
      ...headerFont,
      fontSize: LightTheme.typography.HeadingSmall.fontSize,
    },
    HeadingMedium: {
      ...headerFont,
      fontSize: LightTheme.typography.HeadingMedium.fontSize,
    },
    HeadingLarge: {
      ...headerFont,
      fontSize: LightTheme.typography.HeadingLarge.fontSize,
    },
    HeadingXLarge: {
      ...headerFont,
      fontSize: LightTheme.typography.HeadingXLarge.fontSize,
    },
    HeadingXXLarge: {
      ...headerFont,
      fontSize: LightTheme.typography.HeadingXXLarge.fontSize,
    },

    ParagraphMedium: {
      fontFamily: primaryFontFamily,
      fontWeight: 300,
      fontSize: "18px",
      lineHeight: "1.6",
    },
  },
}

export const theme = createTheme(primitives, overrides)

export type CustomTheme = typeof theme

export interface CustomOverrides {
  $theme: CustomTheme
  [k: string]: any
}

export const themedUseStyletron = createThemedUseStyletron<CustomTheme>()
