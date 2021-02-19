import { theme } from "@econnessione/shared/theme/CustomTheme";
import { BaseProvider } from "baseui";
import * as React from "react";
import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

const engine = new Styletron()
const withThemeProvider = (Story, context) => {
  return (
    <StyletronProvider value={engine}>
      <BaseProvider
        theme={theme}
        overrides={{
          AppContainer: {
            style: () => ({
              minHeight: "100%",
              display: "flex",
            }),
          },
        }}
      >
        <Story {...context} />
      </BaseProvider>
    </StyletronProvider>
  )
}
export const decorators = [withThemeProvider]
