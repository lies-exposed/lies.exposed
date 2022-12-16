import { firstArea } from "@liexp/shared/mock-data/areas";
import {
  AreaPageContent,
  type AreaPageContentProps,
} from "@liexp/ui/components/AreaPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useActorsQuery } from "@liexp/ui/state/queries/actor.queries";
import { type Meta, type Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/AreaPageContent",
  component: AreaPageContent,
};

export default meta;

const Template: Story<AreaPageContentProps> = (props) => {
  return (
    <QueriesRenderer
      queries={{
        actors: useActorsQuery(
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
          false
        ),
      }}
      render={({ actors }) => {
        return (
          <MainContent>
            <AreaPageContent {...props} {...actors.data[0]} />
          </MainContent>
        );
      }}
    />
  );
};

const AreaPageContentExample = Template.bind({});

const args: AreaPageContentProps = {
  area: firstArea,
  onGroupClick: () => {},
};

AreaPageContentExample.args = args;

export { AreaPageContentExample };
