import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  MediaSlider,
  type MediaSliderProps,
} from "@liexp/ui/lib/components/sliders/MediaSlider.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Components/Sliders/MediaSlider",
  component: MediaSlider,
  argTypes: {
    enableDescription: {
      control: { type: "select", options: [true, false] },
    },
  },
};

export default meta;

const Template: StoryFn<Omit<MediaSliderProps, "media"> & { id: string }> = ({
  id: _id,
  ...props
}) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        media: Q.Media.list.useQuery(undefined, undefined, false),
      })}
      render={({ media }) => {
        return (
          <MainContent>
            <MediaSlider {...props} data={media.data} />
          </MainContent>
        );
      }}
    />
  );
};

const MediaSliderExample = Template.bind({});

MediaSliderExample.args = {
  enableDescription: true,
  onClick: () => {},
};

export { MediaSliderExample };
