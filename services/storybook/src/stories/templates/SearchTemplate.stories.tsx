import SearchAreaTemplate, {
  type SearchAreaTemplateProps,
} from "@liexp/ui/lib/templates/SearchAreaTemplate.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Area/Search",
  component: SearchAreaTemplate,
};

export default meta;

const Template: StoryFn<SearchAreaTemplateProps> = (props) => {
  return <SearchAreaTemplate {...props} />;
};

const AreaTemplateDefault = Template.bind({});

AreaTemplateDefault.args = {};

export { AreaTemplateDefault };
