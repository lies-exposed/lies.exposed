import SearchAreaTemplate, {
  SearchAreaTemplateProps,
} from "@liexp/ui/templates/SearchAreaTemplate";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Area/Search",
  component: SearchAreaTemplate,
};

export default meta;

const Template: Story<SearchAreaTemplateProps> = (props) => {

  return <SearchAreaTemplate {...props} />;
};

const AreaTemplateDefault = Template.bind({});

AreaTemplateDefault.args = {};

export { AreaTemplateDefault };
