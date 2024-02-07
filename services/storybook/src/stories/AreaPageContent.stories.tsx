import {
  AreaPageContent,
  type AreaPageContentProps,
} from "@liexp/ui/lib/components/AreaPageContent.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/AreaPageContent",
  component: AreaPageContent,
};

export default meta;

const Template: StoryFn<AreaPageContentProps> = (props) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        areas: Q.Area.list.useQuery(
          {
            filter: {},
            pagination: {
              perPage: 1,
              page: 1,
            },
            sort: {
              field: "createdAt",
              order: "DESC",
            },
          },
          undefined,
          false,
        ),
      })}
      render={({ areas }) => {
        return (
          <MainContent>
            <AreaPageContent {...props} {...areas.data[0]} />
          </MainContent>
        );
      }}
    />
  );
};

const AreaPageContentExample = Template.bind({});

AreaPageContentExample.args = {
};

export { AreaPageContentExample };
