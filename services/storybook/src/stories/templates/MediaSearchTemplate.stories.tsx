import MediaSearchPageUI, {
  type MediaSearchTemplateProps,
} from "@liexp/ui/templates/MediaSearchTemplate";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Media/SearchPage",
  component: MediaSearchPageUI,
};

export default meta;

const Template: Story<MediaSearchTemplateProps> = (props) => {
  const [f, setFilter] = React.useState(props.filter);

  return <MediaSearchPageUI {...props} filter={f} onFilterChange={setFilter} />;
};

const MediaTemplateDefault = Template.bind({});

MediaTemplateDefault.args = {
  filter: {
    title: "Covid",
    keywords: [],
    groups: [],
    actors: [],
  },
  perPage: 10,
};

export { MediaTemplateDefault };
