import { faSlack } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomTheme, themedUseStyletron } from "@theme/CustomeTheme";
import { withStyle } from "baseui";
import {
  ALIGN,
  HeaderNavigation,
  StyledNavigationItem,
  StyledNavigationList
} from "baseui/header-navigation";
import { StyledLink } from "baseui/link";
import { StatefulMenu } from "baseui/menu";
import {
  PLACEMENT as PopoverPlacement,
  StatefulPopover,
  TRIGGER_TYPE
} from "baseui/popover";
import React from "react";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  subItems: Array<Omit<MenuItem, "subItems">>;
}

interface MenuItemProps {
  item: MenuItem;
  pos: number;
}

const NavigationItem = withStyle(
  StyledNavigationItem,
  ({ $theme }: { $theme: CustomTheme }) => {
    return {
      fontFamily: $theme.typography.secondaryFont,
      color: $theme.colors.brandSecondary,
    };
  }
);

const NavigationLink = withStyle(
  StyledLink as any,
  ({ $theme }: { $theme: CustomTheme }) => {
    return {
      fontFamily: $theme.typography.secondaryFont,
      fontWeight: $theme.typography.HeadingLarge.fontWeight,
      color: $theme.colors.brandSecondary,
      textDecoration: "none",
      cursor: "pointer",
    };
  }
);
// eslint-disable-next-line react/display-name
const renderMenuLink = ($theme: CustomTheme): React.FC<MenuItemProps> => ({
  item,
}) => {
  return (
    <NavigationItem key={item.label} path={item.href}>
      {item.subItems.length > 0 ? (
        <StatefulPopover
          placement={PopoverPlacement.bottomLeft}
          autoFocus={true}
          focusLock={true}
          triggerType={TRIGGER_TYPE.hover}
          content={({ close }) => (
            <StatefulMenu
              items={item.subItems}
              overrides={{
                List: {
                  style: {
                    border: "none",
                  },
                },
                ListItem: {
                  style: {
                    fontFamily: $theme.typography.secondaryFont,
                    fontWeight: $theme.typography.HeadingLarge.fontWeight,
                    color: $theme.colors.brandSecondary,
                    textTransform: "uppercase",
                    textAlign: "right",
                  },
                },
              }}
              onItemSelect={async ({ item }) => {
                // await navigate(item.path)
                close();
              }}
            />
          )}
        >
          <NavigationLink href={item.href}>{item.label}</NavigationLink>
        </StatefulPopover>
      ) : (
        <NavigationLink href={item.href}>{item.label}</NavigationLink>
      )}
    </NavigationItem>
  );
};

export const mainMenu: MenuItem[] = [
  // {
  //   id: "project",
  //   href: "/project",
  //   label: "Progetto",
  //   subItems: [
  //     {
  //       id: "the-crisis",
  //       href: "/the-crisis",
  //       label: "La Crisi",
  //     },
  //     {
  //       id: "docs",
  //       href: "/docs",
  //       label: "Docs",
  //     },
  //   ],
  // },
  // {
  //   id: "blog",
  //   href: "/blog",
  //   label: "Blog",
  //   subItems: [],
  // },
  // {
  //   id: "events",
  //   href: "/events",
  //   label: "Events",
  //   subItems: [
  //     {
  //       id: "actors",
  //       href: "/actors",
  //       label: "Attori",
  //     },
  //     {
  //       id: "groups",
  //       href: "/groups",
  //       label: "Groups",
  //     },
  //     {
  //       id: "topics",
  //       href: "/topics",
  //       label: "Topics",
  //     },
  //     {
  //       id: "areas",
  //       href: "/areas",
  //       label: "Aree",
  //     },
  //     {
  //       id: "projects",
  //       href: "/projects",
  //       label: "Progetti",
  //     },
  //   ],
  // },
];

const Header: React.FC = () => {
  const {
    site: {
      siteMetadata: { title, github },
    },
  } = {
    site: {
      siteMetadata: {
        title: "ECONNESSIONE",
        github: { repo: "econnessione", user: "ascariandrea" },
      },
    },
  };

  const [, $theme] = themedUseStyletron();

  const menuLinkRenderer = renderMenuLink($theme);
  return (
    <HeaderNavigation
      overrides={{
        Root: {
          style: {},
        },
      }}
    >
      <StyledNavigationList $align={ALIGN.left}>
        {menuLinkRenderer({
          item: { id: "home", label: title, href: "/", subItems: [] },
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
        <NavigationItem>
          <FontAwesomeIcon icon={faSlack} />
        </NavigationItem>
      </StyledNavigationList>
      <StyledNavigationList $align={ALIGN.center} />
      <StyledNavigationList $align={ALIGN.right}>
        {mainMenu.map((i, k) => menuLinkRenderer({ item: i, pos: k }))}
      </StyledNavigationList>
    </HeaderNavigation>
  );
};

export default Header;
