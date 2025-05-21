import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  MediaList,
  type MediaListProps,
} from "@liexp/ui/lib/components/lists/MediaList.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Media/MediaList",
  component: MediaList,
};

export default meta;

const Template: StoryFn<MediaListProps> = (props) => {
  const ref = React.createRef();

  return (
    <div style={{ height: "100%" }}>
      <QueriesRenderer
        queries={(Q) => ({
          media: Q.Media.list.useQuery(undefined, { _end: "20" }, false),
        })}
        render={({ media }) => {
          return (
            <MediaList
              {...props}
              media={media.data.map((s) => ({ ...s, selected: true }))}
            />
          );
        }}
      />
    </div>
  );
};

const MediaListExample = Template.bind({});

MediaListExample.args = {
  media: [],
  onItemClick: () => {},
};

const EnabledDescription = Template.bind({});
EnabledDescription.args = {
  enableDescription: true,
};

export { MediaListExample as MediaList, EnabledDescription };
