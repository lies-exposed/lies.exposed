import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  type AreaTemplateProps,
  AreaTemplateUI,
} from "@liexp/ui/lib/templates/AreaTemplate.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Area/Page",
  component: AreaTemplateUI,
};

export default meta;

const Template: StoryFn<AreaTemplateProps> = (props) => {
  const [tab, setTab] = React.useState(0);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        area: Q.Area.list.useQuery(
          undefined,
          {
            _end: "10",
          },
          false,
        ),
      })}
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
