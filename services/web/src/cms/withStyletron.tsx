import { BaseProvider } from "baseui"
import React, { useState, useEffect } from "react"
import { StyleSheetManager } from "styled-components"
import { Provider as StyletronProvider } from "styletron-react"
import { theme } from "theme/CustomeTheme"
// eslint-disable-next-line no-restricted-imports
import "../scss/main.scss"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const styletron = require("gatsby-plugin-styletron")

const engine = styletron().instance

const StyleInjector: React.FC = ({ children }) => {
  const [iframeRef, setIframeRef] = useState<HTMLHeadElement | null>(null)

  useEffect(() => {
    const previewIframe = window.document.getElementsByTagName("iframe")[0]
    const iframeHeadElem = previewIframe?.contentDocument?.head
    if (iframeHeadElem !== undefined) {
      setIframeRef(iframeHeadElem)
    }
  }, [])

  return iframeRef !== null ? (
    <StyleSheetManager target={iframeRef}>
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
          {children}
        </BaseProvider>
      </StyletronProvider>
    </StyleSheetManager>
  ) : null
}

export const withStyletron = <P extends {}>(Comp: React.FC<P>): React.FC<P> => {
  const renderWithStyle: React.FC<P> = (props) => (
    <StyleInjector>
      <Comp {...props} />
    </StyleInjector>
  )

  return renderWithStyle
}
