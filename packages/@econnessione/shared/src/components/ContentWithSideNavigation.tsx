import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { Item, Navigation } from "baseui/side-navigation";
import { Theme } from "baseui/theme";
import * as React from "react";
import { MainContent } from "./MainContent";

interface ContentWithSideNavigation {
  items: Item[];
}

export const ContentWithSideNavigation: React.FC<ContentWithSideNavigation> = ({
  items,
  children,
}) => {
  const [activeItemId, setActiveItemId] = React.useState("#primary");

  const navigationProps = {
    onChange: (args: { event: React.SyntheticEvent<any>; item: Item }) => {
      if (args.item.itemId !== undefined) {
        setActiveItemId(args.item.itemId);
      }
    },
  };

  return (
    <FlexGrid flexGridColumnCount={4} height="100%">
      <FlexGridItem height="100%" overflow="auto">
        <Navigation
          {...navigationProps}
          items={items}
          activeItemId={activeItemId}
        />
      </FlexGridItem>
      <FlexGridItem
        height="100%"
        overflow="auto"
        overrides={{
          Block: {
            style: ({ $theme }: { $theme: Theme }) => {
              return {
                width: `calc((300% - ${$theme.sizing.scale800}) / 4)`,
              };
            },
          },
        }}
      >
        <MainContent>{children}</MainContent>
      </FlexGridItem>
      <FlexGridItem display="none" />
      <FlexGridItem display="none" />
    </FlexGrid>
  );
};
