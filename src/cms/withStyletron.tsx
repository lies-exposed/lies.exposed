import { BaseProvider } from "baseui"
import * as React from "react"
import { StyleSheetManager } from "styled-components"
import {Client as Styletron} from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from "styletron-react"
import { theme } from "theme/CustomeTheme"

// eslint-disable-next-line no-restricted-imports
// eslint-disable-next-line @typescript-eslint/no-var-requires

const engine = new Styletron();

// eslint-disable-next-line react/display-name
export const withStyletron = <P extends {}>(Comp: React.FC<P>) => (
  props: P
) => {
  const iframes = document.querySelectorAll("iframe")
  const iframe = iframes[0]
  const target = iframe.contentDocument?.head

  return (
    <StyleSheetManager target={target}>
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
          <Comp {...props} />
        </BaseProvider>
      </StyletronProvider>
    </StyleSheetManager>
  )
}
