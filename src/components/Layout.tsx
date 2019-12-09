import React from "react"
import PropTypes from "prop-types"
import Header from "./Header"
import FlexView from "react-flexview"

interface LayoutProps {
  children: PropTypes.ReactElementLike[]
}

const Layout = ({ children }: LayoutProps) => {
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

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
