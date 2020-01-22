import { Link, graphql, useStaticQuery } from "gatsby"
import * as PropTypes from "prop-types"
import React from "react"
import { Navbar } from "react-bulma-components"

const NavbarLink = Navbar.Link as any

interface MenuItem {
  id: string
  title: string
  path: string
}

type SecondLevelMenuItem = MenuItem

export interface FirstLevelMenuItem extends MenuItem {
  items: SecondLevelMenuItem[]
}

interface MenuItemProps {
  item: MenuItem
  pos: number
}
const renderMenuLink: React.FC<MenuItemProps> = ({ item, pos: total }) => {
  return (
    <NavbarLink
      key={item.title}
      renderAs={Link}
      to={item.path}
      arrowless={total === 0}
    >
      {item.title}
    </NavbarLink>
  )
}

interface NavBarItemProps {
  item: FirstLevelMenuItem
}

const renderNavBarItem: React.FC<NavBarItemProps> = ({ item }) => (
  <Navbar.Item
    renderAs="div"
    key={item.title}
    hoverable={true}
    dropdown={item.items.length > 0}
  >
    {renderMenuLink({ item, pos: item.items.length })}
    {item.items.length > 0 ? (
      <Navbar.Dropdown>
        {item.items.map((item, k) => renderMenuLink({ item, pos: k }))}
      </Navbar.Dropdown>
    ) : null}
  </Navbar.Item>
)

const Header: React.FC = () => {
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
    {
      id: "networks",
      path: "/networks",
      title: "Networks",
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
        <Navbar.Item renderAs="div">
          {renderNavBarItem({ item: homeItem })}
        </Navbar.Item>
        <Navbar.Burger />
      </Navbar.Brand>
      <Navbar.Menu>
        <Navbar.Container>
          {items.map(item => renderNavBarItem({ item }))}
        </Navbar.Container>
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
