import { type MediaType } from "@liexp/shared/io/http/Media";
import { MainContent } from "@liexp/ui/components/MainContent";
import MediaElement, {
  type MediaElementProps,
} from "@liexp/ui/components/Media/MediaElement";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useMediaQuery } from "@liexp/ui/state/queries/media.queries";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Media/MediaElement",
  component: MediaElement,
};

export default meta;

const Template: Story<MediaElementProps & { type: MediaType }> = ({
  type,
  ...props
}) => {
  return (
    <QueriesRenderer
      queries={{
        actor: useMediaQuery(
          { filter: { type }, pagination: { perPage: 1, page: 1 } },
          false
        ),
      }}
      render={({ actor }) => {
        return (
          <MainContent>
            <MediaElement {...props} media={actor.data[0]} />
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
