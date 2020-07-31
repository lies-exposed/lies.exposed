import { BaseProvider } from "baseui"
import React, { useState, useEffect } from "react"
import { StyleSheetManager } from "styled-components"
import { theme, GlobalStyle } from "theme/CustomeTheme"
// eslint-disable-next-line no-restricted-imports
import "../scss/main.scss"

const StyleInjector: React.FC = ({ children }) => {
  const [iframeRef, setIframeRef] = useState<HTMLHeadElement | null>(null)

  useEffect(() => {
    const iframes = document.getElementsByTagName("iframe")
    const previewIframe = Array.from(iframes).find(x => {
      return x.className.includes("PreviewPaneFrame")
    })
    const iframeHeadElem = previewIframe?.contentDocument?.head
    if (iframeHeadElem !== undefined) {
      setIframeRef(iframeHeadElem)
    }
  }, [])

  return iframeRef !== null ? (
    <StyleSheetManager target={iframeRef}>
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
        <GlobalStyle />
        {children}
      </BaseProvider>
    </StyleSheetManager>
  ) : null
}

export const withStyletron = <P extends {}>(Comp: React.FC<P>): React.FC<P> => {
  const renderWithStyle: React.FC<P> = props => (
    <StyleInjector>
      <Comp {...props} />
    </StyleInjector>
  )

  return renderWithStyle
}
