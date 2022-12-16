import { type MediaType } from "@liexp/shared/io/http/Media";
import {
  ActorPageContent,
  ActorPageContentProps,
} from "@liexp/ui/components/ActorPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import MediaElement, {
  type MediaElementProps,
} from "@liexp/ui/components/Media/MediaElement";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import {
  useActorQuery,
  useActorsQuery,
  useGroupsQuery,
  useMediaQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Media/MediaElement",
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
