import {theme} from "@theme/CustomeTheme"
import { BaseProvider } from "baseui"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import * as React from "react"
import { Footer } from "./Footer"
import Header from "./Header"

interface LayoutProps {
  style?: React.CSSProperties
}

export const Layout: React.FC<LayoutProps> = ({ children, style }) => {
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
      <FlexGrid
        width="100%"
        minHeight="100%"
        margin="0"
        overrides={{
          Block: {
            style: () => ({
              ...style,
            }),
          },
        }}
      >
        <FlexGridItem width="100%" minHeight="100%" flexDirection="column">
          <Header />
          {children}
        </FlexGridItem>
        <Footer  />
      </FlexGrid>
    </BaseProvider>
  )
}
