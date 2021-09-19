import { firstArea } from "@econnessione/shared/mock-data/areas";
import {
  AreaPageContent,
  AreaPageContentProps,
} from "@econnessione/ui/components/AreaPageContent";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/AreaPageContent",
  component: AreaPageContent,
};

export default meta;

const Template: Story<AreaPageContentProps> = (props) => {
  return (
    <div>
      <ul>
        <li>Lista dei progetti in questa area</li>
      </ul>
      <AreaPageContent {...props} />
    </div>
  );
};

const AreaPageContentExample = Template.bind({});

const args: AreaPageContentProps = {
  ...firstArea,
  onGroupClick: () => {},
  onTopicClick: () => {},
};

AreaPageContentExample.args = args;

export { AreaPageContentExample };
