import {
  themeOptions,
  secondary,
  type ThemeOptions,
} from "@liexp/ui/lib/theme/index.js";

const adminThemeOptions: ThemeOptions = {
  ...themeOptions,
  components: {
    ...themeOptions.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: secondary,
        },
      },
    },
  },
};

export { adminThemeOptions };
