import * as PropTypes from "prop-types"
import React from "react"
import { Navbar } from "react-bulma-components"
import { Link, graphql, useStaticQuery } from "gatsby"

const NavbarLink = Navbar.Link as any

interface MenuItem {
  id: string
  title: string
  path: string
}

interface SecondLevelMenuItem extends MenuItem {}

export interface FirstLevelMenuItem extends MenuItem {
  items: SecondLevelMenuItem[]
}

const renderMenuLink = (i: MenuItem, itemsLength: number) => {
  return (
    <NavbarLink
      key={i.title}
      renderAs={Link}
      to={i.path}
      arrowless={itemsLength === 0}
    >
      {i.title}
    </NavbarLink>
  )
}

const renderNavBarItem = (i: FirstLevelMenuItem) => (
  <Navbar.Item
    renderAs="div"
    key={i.title}
    hoverable={true}
    dropdown={i.items.length > 0}
  >
    {renderMenuLink(i, i.items.length)}
    {i.items.length > 0 ? (
      <Navbar.Dropdown>{i.items.map(renderMenuLink)}</Navbar.Dropdown>
    ) : null}
  </Navbar.Item>
)

const Header = () => {
  const {
    site: {
      siteMetadata: { title },
    },
  } = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const items: FirstLevelMenuItem[] = [
    {
      id: "articles",
      path: "/articles",
      title: "Articoli",
      items: [],
    },
    {
      id: "timelines",
      path: "/timelines",
      title: "Timelines",
      items: [],
    },
  ]

  const homeItem = {
    id: "home",
    path: "/",
    title: title.toUpperCase(),
    items: [],
  }

  // const endItem = {
  //   id: "support",
  //   path: "/support",
  //   title: "Support Us",
  //   items: [],
  // }

  return (
    <Navbar color="success" fixed="top" active={true} transparent={true}>
      <Navbar.Brand>
        <Navbar.Item renderAs="div">{renderNavBarItem(homeItem)}</Navbar.Item>
        <Navbar.Burger />
      </Navbar.Brand>
      <Navbar.Menu>
        <Navbar.Container>{items.map(renderNavBarItem)}</Navbar.Container>
        {/* <Navbar.Container position="end">
          {renderNavBarItem(endItem)}
        </Navbar.Container> */}
      </Navbar.Menu>
    </Navbar>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
