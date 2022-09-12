import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import {
    MediaList,
    MediaListProps
} from "@liexp/ui/components/lists/MediaList";
import { useMediaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Meta, Story } from "@storybook/react/types-6-0";
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

const args: MediaListProps = {
  media: [],
  onItemClick: () => {},
};

MediaListExample.args = args;

export { MediaListExample as MediaList };
