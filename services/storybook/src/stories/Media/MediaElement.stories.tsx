import { type MediaType } from "@liexp/shared/lib/io/http/Media";
import { MainContent } from "@liexp/ui/lib/components/MainContent";
import MediaElement, {
  type MediaElementProps,
} from "@liexp/ui/lib/components/Media/MediaElement";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Media/MediaElement",
  component: MediaElement,
};

export default meta;

const Template: StoryFn<MediaElementProps & { type: MediaType }> = ({
  type,
  ...props
}) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        media: Q.Media.list.useQuery(
          { filter: { type }, pagination: { perPage: 1, page: 1 } },
          undefined,
          false,
        ),
      })}
      render={({ media }) => {
        return (
          <MainContent>
            <MediaElement {...props} media={media.data[0]} />
          </MainContent>
        );
      }}
    />
  );
};

const AudioElement = Template.bind({});

AudioElement.args = {
  type: "audio/ogg",
};

const IframeVideoElement = Template.bind({});
IframeVideoElement.args = {
  type: "iframe/video",
};

const MP4VideoElement = Template.bind({});
MP4VideoElement.args = {
  type: "video/mp4",
};

export { AudioElement, IframeVideoElement, MP4VideoElement };
