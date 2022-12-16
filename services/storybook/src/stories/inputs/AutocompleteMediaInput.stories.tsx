import { type Media } from "@liexp/shared/io/http";
import {
  AutocompleteMediaInput,
  type AutocompleteMediaInputProps
} from "@liexp/ui/components/Input/AutocompleteMediaInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/inputs/AutocompleteMediaInput",
  component: AutocompleteMediaInput,
};

export default meta;

const Template: Story<AutocompleteMediaInputProps> = (props) => {
  const [items, setItems] = React.useState<Media.Media[]>([]);
  return (
    <MainContent>
      <AutocompleteMediaInput selectedItems={items} onChange={setItems} />
    </MainContent>
  );
};

const AutocompleteMediaInputExample = Template.bind({});

AutocompleteMediaInputExample.args = {};

export { AutocompleteMediaInputExample };
