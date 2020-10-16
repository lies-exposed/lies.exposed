import * as React from "react"
import { BaseProvider } from "baseui"
import { theme } from "../src/theme/CustomeTheme"
import {Provider as StyletronProvider} from 'styletron-react';
import { Client as Styletron } from "styletron-engine-atomic"

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
