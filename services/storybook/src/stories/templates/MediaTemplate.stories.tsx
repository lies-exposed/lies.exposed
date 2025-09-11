import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  MediaTemplateUI,
  type MediaTemplateUIProps,
} from "@liexp/ui/lib/templates/MediaTemplateUI.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
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
          undefined,
          {
            _end: "1",
          },
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
