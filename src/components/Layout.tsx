import { LightTheme, BaseProvider, styled } from "baseui"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import PropTypes from "prop-types"
import * as React from "react"
import { Footer } from "./Footer"
import Header from "./Header"
// eslint-disable-next-line no-restricted-imports
import '../scss/main.scss'

interface LayoutProps {
  children: PropTypes.ReactElementLike[]
}

const Centered = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
})

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <BaseProvider theme={LightTheme}>
      <Centered>
        <FlexGrid height="100%" width="100%" flexDirection="column" margin="0">
          <FlexGrid width="100%" margin="0">
            <Header />
            <FlexGridItem width="100%" height="100%" flexDirection="column">
              {children}
            </FlexGridItem>
            <Footer githubLink={'https://github.com/ascariandrea/fiume-in-piena'} />
          </FlexGrid>
        </FlexGrid>
      </Centered>
    </BaseProvider>
  )
}

export default Layout
