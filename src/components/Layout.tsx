import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"
import Header from "./Header"
import Columns from "react-bulma-components/lib/components/columns"
import Container from "react-bulma-components/lib/components/container"
import Footer from "react-bulma-components/lib/components/footer"

import "./layout.scss"

interface LayoutProps {
  children: PropTypes.ReactNodeArray
}

const Layout = ({ children }: LayoutProps) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <Container>
      <Header siteTitle={data.site.siteMetadata.title} />

      <div className="main-content">
        <Columns>{children}</Columns>
      </div>
    </Container>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
