import { type Media } from "@liexp/shared/lib/io/http/index.js";
import {
  AutocompleteMediaInput,
  type AutocompleteMediaInputProps,
} from "@liexp/ui/lib/components/Input/AutocompleteMediaInput.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Components/Media/inputs/AutocompleteMediaInput",
  component: AutocompleteMediaInput,
};

export default meta;

const Template: StoryFn<AutocompleteMediaInputProps> = () => {
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
