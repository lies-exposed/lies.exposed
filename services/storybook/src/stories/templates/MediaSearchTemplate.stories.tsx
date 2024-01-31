import MediaSearchPageUI, {
  type MediaSearchTemplateProps,
} from "@liexp/ui/lib/templates/MediaSearchTemplate.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Media/SearchPage",
  component: MediaSearchPageUI,
};

export default meta;

const Template: StoryFn<MediaSearchTemplateProps> = (props) => {
  const [f, setFilter] = React.useState(props.filter as any);

  return <MediaSearchPageUI {...props} filter={f} onFilterChange={setFilter} />;
};

const MediaTemplateDefault = Template.bind({});

MediaTemplateDefault.args = {
  filter: {
    filter: {
      search: "Covid",
      keywords: [],
      startDate: "2020-01-01",
      endDate: "2020-12-31",
    },
  },
  perPage: 10,
};

export { MediaTemplateDefault };
