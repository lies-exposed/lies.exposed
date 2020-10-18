import { CustomTheme } from "@theme/CustomeTheme"
import { withStyle } from "baseui"
import {
  ALIGN,
  HeaderNavigation,
  StyledNavigationItem,
  StyledNavigationList,
} from "baseui/header-navigation"
import { StyledLink } from "baseui/link"
import { StatefulMenu } from "baseui/menu"
import {
  PLACEMENT as PopoverPlacement,
  StatefulPopover,
  TRIGGER_TYPE,
} from "baseui/popover"
import { graphql, navigate, useStaticQuery } from "gatsby"
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

const NavigationItem = withStyle(
  StyledNavigationItem,
  ({ $theme }: { $theme: CustomTheme }) => {
    return {
      fontFamily: $theme.typography.secondaryFont,
      color: $theme.colors.brandSecondary,
    }
  }
)

const NavigationLink = withStyle(
  StyledLink as any,
  ({ $theme }: { $theme: CustomTheme }) => {
    return {
      fontFamily: $theme.typography.secondaryFont,
      color: $theme.colors.brandSecondary,
      textDecoration: "none",
      textTransform: "uppercase",
      cursor: "pointer",
    }
  }
)
const renderMenuLink: React.FC<MenuItemProps> = ({ item }) => {
  return (
    <NavigationItem key={item.label} path={item.path}>
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
          <NavigationLink href={item.path}>{item.label}</NavigationLink>
        </StatefulPopover>
      ) : (
        <NavigationLink href={item.path}>{item.label}</NavigationLink>
      )}
    </NavigationItem>
  )
}

const Header: React.FC = () => {
  const {
    site: {
      siteMetadata: { title, github },
    },
  } = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
          github {
            user
            repo
          }
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
        {
          id: "areas",
          path: "/areas",
          label: "Aree",
        },
        {
          id: "projects",
          path: "/projects",
          label: "Progetti",
        },
      ],
    },
  ]

  // const [, $theme] = themedUseStyletron()

  return (
    <HeaderNavigation
      overrides={{
        Root: {
          style: {},
        },
      }}
    >
      <StyledNavigationList $align={ALIGN.left}>
        {renderMenuLink({
          item: { id: "home", label: title, path: "/", subItems: [] },
          pos: 0,
        })}
        <NavigationItem>
          <iframe
            src={`https://ghbtns.com/github-btn.html?user=${github.user}&repo=${github.repo}&type=star&count=true&size=small`}
            frameBorder="0"
            scrolling="0"
            width="100"
            height="20"
            title="GitHub"
            style={{ verticalAlign: "middle" }}
          />
        </NavigationItem>
      </StyledNavigationList>
      <StyledNavigationList $align={ALIGN.center} />
      <StyledNavigationList $align={ALIGN.right}>
        {items.map((i, k) => renderMenuLink({ item: i, pos: k }))}
      </StyledNavigationList>
    </HeaderNavigation>
  )
}

export default Header
