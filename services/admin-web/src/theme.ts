import { themeOptions, secondary, ThemeOptions } from "@liexp/ui/theme";

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
