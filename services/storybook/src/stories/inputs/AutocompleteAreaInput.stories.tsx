import { type Area } from "@liexp/shared/lib/io/http/index.js";
import {
  AutocompleteAreaInput,
  type AutocompleteAreaInputProps,
} from "@liexp/ui/lib/components/Input/AutocompleteAreaInput.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import * as React from "react";

const meta = {
  title: "Components/Area/inputs/AutocompleteAreaInput",
  component: AutocompleteAreaInput,
  render: () => {
    const [items, setItems] = React.useState<Area.Area[]>([]);
    return (
      <MainContent>
        <AutocompleteAreaInput selectedItems={items} onChange={setItems} />
      </MainContent>
    );
  },
} satisfies Meta<AutocompleteAreaInputProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const AutocompleteAreaInputExample: Story = {
  args: {
    selectedItems: [],
    onChange: () => {},
  },
};

export { AutocompleteAreaInputExample };
