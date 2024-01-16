import { type Area } from "@liexp/shared/lib/io/http/index.js";
import {
  AutocompleteAreaInput,
  type AutocompleteAreaInputProps,
} from "@liexp/ui/lib/components/Input/AutocompleteAreaInput.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Area/inputs/AutocompleteAreaInput",
  component: AutocompleteAreaInput,
};

export default meta;

const Template: StoryFn<AutocompleteAreaInputProps> = (props) => {
  const [items, setItems] = React.useState<Area.Area[]>([]);
  return (
    <MainContent>
      <AutocompleteAreaInput selectedItems={items} onChange={setItems} />
    </MainContent>
  );
};

const AutocompleteAreaInputExample = Template.bind({});
AutocompleteAreaInputExample.args = {};

export { AutocompleteAreaInputExample };
