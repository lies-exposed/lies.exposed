import { Box, ThemeProvider } from "@material-ui/core";
import { CellPlugin } from "@react-page/editor";
import * as React from "react";
import { ECOTheme } from "../../../../theme/index";

interface GridCellData {
  column: boolean;
  backgroundColor: string;
}

const gridCellPlugin: CellPlugin<GridCellData> = {
  Renderer: ({ children, data }) => {
    return (
      <Box
        display="flex"
        flexDirection={data.column ? "column" : "row"}
        style={{
          backgroundColor: data.backgroundColor,
        }}
      >
        {children}
      </Box>
    );
  },
  Provider: ({ children }) => (
    <ThemeProvider theme={ECOTheme}>{children}</ThemeProvider>
  ),

  cellSpacing: () => 1,

  createInitialData: () => ({
    backgroundColor: "transparent",
    column: true,
  }),

  id: "grid-component",
  title: "Grid component",
  description: "Grid building block",
  version: 1,

  controls: {
    type: "autoform",
    columnCount: 7,
    schema: {
      required: ["backgroundColor"],
      properties: {
        backgroundColor: { type: "string", title: "Background Color" },
        xs: { type: "number", title: "xs" },
        sm: { type: "number", title: "sm" },
        md: { type: "number", title: "md" },
        lg: { type: "number", title: "lg" },
        xl: { type: "number", title: "xl" },
        column: { type: "boolean", title: "Column direction" },
      },
    },
  },
};

export default gridCellPlugin;
