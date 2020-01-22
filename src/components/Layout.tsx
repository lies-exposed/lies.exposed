import PropTypes from "prop-types"
import React from "react"
import FlexView from "react-flexview"
import Header from "./Header"

interface LayoutProps {
  children: PropTypes.ReactElementLike[]
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <FlexView>
      <Header />
      <FlexView
        className="main-content"
        grow={true}
        style={{ marginTop: 40 }}
        column
      >
        {children}
      </FlexView>
    </FlexView>
  )
}

export default Layout
