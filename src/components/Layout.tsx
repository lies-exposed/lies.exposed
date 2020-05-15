import theme, { GlobalStyle } from "@theme/CustomeTheme"
import { BaseProvider } from "baseui"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import * as React from "react"
import { Footer } from "./Footer"
import Header from "./Header"

export const Layout: React.FC = ({ children }) => {

  return (
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
        <FlexGrid width="100%" minHeight="100%" margin="0">
          <FlexGrid width="100%" minHeight="100%">
            <FlexGridItem width="100%" minHeight="100%" flexDirection="column">
              <Header />
              {children}
            </FlexGridItem>
            <Footer
              githubLink={"https://github.com/ascariandrea/econessione"}
            />
          </FlexGrid>
        </FlexGrid>
      </BaseProvider>
  )
}
