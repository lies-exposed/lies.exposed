import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import {
  MediaTemplateUI,
  type MediaTemplateUIProps,
} from "@liexp/ui/lib/templates/MediaTemplateUI";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Media/Page",
  component: MediaTemplateUI,
};

export default meta;

const Template: StoryFn<MediaTemplateUIProps> = (props) => {
  const [tab, setTab] = React.useState(0);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        media: Q.Media.list.useQuery(
          {
            pagination: { perPage: 1, page: 1 },
            filter: null,
          },
          undefined,
          false,
        ),
      })}
      render={({ media: { data } }) => {
        return (
          <MediaTemplateUI
            {...props}
            tab={tab}
            onTabChange={setTab}
            media={data[0]}
          />
        );
      }}
    />
  );
};

const MediaTemplateDefault = Template.bind({});

MediaTemplateDefault.args = {};

export { MediaTemplateDefault };
