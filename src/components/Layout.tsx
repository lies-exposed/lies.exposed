import { LightTheme, BaseProvider, styled } from "baseui"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import PropTypes from "prop-types"
import React from "react"
import Header from "./Header"
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
        <FlexGrid height="100%" width="100%" flexDirection="column">
          <FlexGrid width="100%">
            <Header />
            <FlexGridItem height="100%" flexDirection="column">
              {children}
            </FlexGridItem>
          </FlexGrid>
        </FlexGrid>
      </Centered>
    </BaseProvider>
  )
}

export default Layout
