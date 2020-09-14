import { FlexGridItem } from "baseui/flex-grid"
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem,
} from "baseui/header-navigation"
import { StatefulMenu } from "baseui/menu"
import {
  StatefulPopover,
  PLACEMENT as PopoverPlacement,
  TRIGGER_TYPE,
} from "baseui/popover"
import { graphql, useStaticQuery, Link, navigate } from "gatsby"
import React from "react"

interface MenuItem {
  id: string
  label: string
  path: string
  subItems: Array<Omit<MenuItem, "subItems">>
}

interface MenuItemProps {
  item: MenuItem
  pos: number
}
const renderMenuLink: React.FC<MenuItemProps> = ({ item }) => {
  return (
    <StyledNavigationItem key={item.label} path={item.path}>
      {item.subItems.length > 0 ? (
        <StatefulPopover
          placement={PopoverPlacement.bottomLeft}
          autoFocus={true}
          focusLock={true}
          triggerType={TRIGGER_TYPE.hover}
          content={({ close }) => (
            <StatefulMenu
              items={item.subItems}
              onItemSelect={async ({ item }) => {
                await navigate(item.path)
                close()
              }}
            />
          )}
        >
          <Link to={item.path}>{item.label}</Link>
        </StatefulPopover>
      ) : (
        <Link to={item.path}>{item.label}</Link>
      )}
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
      label: "La Crisi",
      subItems: [],
    },
    {
      id: "project",
      path: "/project",
      label: "Progetto",
      subItems: [],
    },
    {
      id: "blog",
      path: "/blog",
      label: "Blog",
      subItems: [],
    },
    {
      id: "timelines",
      path: "/timelines",
      label: "Timelines",
      subItems: [
        {
          id: "actors",
          path: "/actors",
          label: "Attori",
        },
        {
          id: "groups",
          path: "/groups",
          label: "Groups",
        },
        {
          id: "topics",
          path: "/topics",
          label: "Topics",
        },
      ],
    },
  ]

  return (
    <FlexGridItem>
      <HeaderNavigation>
        <StyledNavigationList $align={ALIGN.left}>
          {renderMenuLink({
            item: { id: "home", label: title, path: "/", subItems: [] },
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

export default Header
