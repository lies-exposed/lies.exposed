import {
  ActorPageContent,
  ActorPageContentProps,
} from "@econnessione/shared/components/ActorPageContent";
import { actorPageContentArgs } from "@econnessione/shared/components/examples/ActorPageContentExample";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/ActorPageContent",
  component: ActorPageContent,
};

export default meta;

const Template: Story<ActorPageContentProps> = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <h2>TODO</h2>
      <ul>
        <li>mostarre impatto progetti finanziati</li>
      </ul>
      <ActorPageContent {...props} />
    </div>
  );
};

const ActorPageExample = Template.bind({});

ActorPageExample.args = actorPageContentArgs;

export { ActorPageExample };
