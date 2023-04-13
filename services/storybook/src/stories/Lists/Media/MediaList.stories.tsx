import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import {
  MediaList,
  type MediaListProps,
} from "@liexp/ui/lib/components/lists/MediaList";
import { useMediaQuery } from "@liexp/ui/lib/state/queries/media.queries";
import { type Meta, type Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Media/MediaList",
  component: MediaList,
};

export default meta;

const Template: Story<MediaListProps> = (props) => {
  const ref = React.createRef();

  return (
    <div style={{ height: "100%" }}>
      <QueriesRenderer
        queries={{
          media: useMediaQuery(
            {
              filter: {},
              pagination: {
                perPage: 20,
                page: 1,
              },
            },
            false
          ),
        }}
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

const HideDescription = Template.bind({});
HideDescription.args = {
  hideDescription: true,
};

export { MediaListExample as MediaList, HideDescription };
