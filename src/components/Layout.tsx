import theme from "@theme/CustomeTheme"
import { BaseProvider } from "baseui"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import PropTypes from "prop-types"
import * as React from "react"
import { Footer } from "./Footer"
import Header from "./Header"

interface LayoutProps {
  children: PropTypes.ReactElementLike[]
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
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
      <FlexGrid width="100%" minHeight="100%" margin="0">
        <FlexGrid width="100%" minHeight="100%">
          <FlexGridItem
            width="100%"
            minHeight="100%"
            flexDirection="column"
          >
            <Header />
            {children}
          </FlexGridItem>
            <Footer
              githubLink={"https://github.com/ascariandrea/fiume-in-piena"}
            />
        </FlexGrid>
      </FlexGrid>
    </BaseProvider>
  )
}
