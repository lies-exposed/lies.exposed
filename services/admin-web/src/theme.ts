import {
  themeOptions,
  colors,
  type ThemeOptions,
} from "@liexp/ui/lib/theme/index.js";

const adminThemeOptions: ThemeOptions = {
  ...themeOptions,
  components: {
    ...themeOptions.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.secondary,
        },
      },
    },
  },
};

export { adminThemeOptions };
