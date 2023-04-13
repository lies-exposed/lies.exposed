import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import {
  useAreasQuery
} from "@liexp/ui/lib/state/queries/area.queries";
import {
  type AreaTemplateProps, AreaTemplateUI
} from "@liexp/ui/lib/templates/AreaTemplate";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Area/Page",
  component: AreaTemplateUI,
};

export default meta;

const Template: Story<AreaTemplateProps> = (props) => {
  const [tab, setTab] = React.useState(0);

  return (
    <QueriesRenderer
      queries={{
        area: useAreasQuery(
          {
            pagination: { perPage: 10, page: 1 },
            filter: {},
          },
          false
        ),
      }}
      render={({ area: { data } }) => {
        return (
          <AreaTemplateUI
            {...props}
            area={data[0]}
            tab={tab}
            onTabChange={setTab}
          />
        );
      }}
    />
  );
};

const AreaTemplateDefault = Template.bind({});

AreaTemplateDefault.args = {};

export { AreaTemplateDefault };
