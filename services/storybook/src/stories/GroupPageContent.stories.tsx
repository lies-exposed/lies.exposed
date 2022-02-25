import {
  GroupPageContent,
  GroupPageContentProps,
} from "@liexp/ui/components/GroupPageContent";
import { groupPageContentArgs } from "@liexp/ui/components/examples/GroupPageContentExample";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/GroupPageContent",
  component: GroupPageContent,
};

export default meta;

const Template: Story<GroupPageContentProps> = (props) => {
  return <GroupPageContent {...props} />;
};

const GroupPageContentExample = Template.bind({});

GroupPageContentExample.args = groupPageContentArgs;

export { GroupPageContentExample };
