import { type CellPlugin } from "@react-page/editor/lib-es/index.js";
import * as React from "react";
import { ECOTheme } from "../../../../theme/index.js";
import { Box, ThemeProvider, StyledEngineProvider } from "../../../mui/index.js";

// interface GridCellData {
//   [index: string]: unknown
//   column: boolean;
//   backgroundColor: string;
// }

const gridCellPlugin: CellPlugin = {
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
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={ECOTheme}>{children}</ThemeProvider>
    </StyledEngineProvider>
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
