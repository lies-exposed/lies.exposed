import { FlexGridItem } from "baseui/flex-grid"
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem,
} from "baseui/header-navigation"
import { StyledLink } from "baseui/link"
import { graphql, useStaticQuery } from "gatsby"
import * as PropTypes from "prop-types"
import React from "react"

interface MenuItem {
  id: string
  title: string
  path: string
}

interface MenuItemProps {
  item: MenuItem
  pos: number
}
const renderMenuLink: React.FC<MenuItemProps> = ({ item, pos: total }) => {
  return (
    <StyledNavigationItem key={item.title} path={item.path}>
      <StyledLink href={item.path}>{item.title}</StyledLink>
    </StyledNavigationItem>
  )
}

const Header: React.FC = () => {
  const {
    site: {
      siteMetadata: { title },
    },
  } = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const items: MenuItem[] = [
    {
      id: "the-crisis",
      path: "/the-crisis",
      title: "La Crisi",
    },
    {
      id: "articles",
      path: "/articles",
      title: "Articoli",
    },
    {
      id: "actors",
      path: "/actors",
      title: "Attori",
    },
    {
      id: "groups",
      path: "/groups",
      title: "Groups",
    },
    {
      id: "topics",
      path: "/topics",
      title: "Topics",
    },
    {
      id: "networks",
      path: "/networks",
      title: "Networks",
    },
  ]

  return (
    <FlexGridItem>
      <HeaderNavigation>
        <StyledNavigationList $align={ALIGN.left}>
          {renderMenuLink({
            item: { id: "home", title: title, path: "/" },
            pos: 0,
          })}
        </StyledNavigationList>
        <StyledNavigationList $align={ALIGN.center} />
        <StyledNavigationList $align={ALIGN.right}>
          {items.map((i, k) => renderMenuLink({ item: i, pos: k }))}
        </StyledNavigationList>
      </HeaderNavigation>
    </FlexGridItem>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
