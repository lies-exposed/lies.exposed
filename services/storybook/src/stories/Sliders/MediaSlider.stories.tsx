import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import {
  MediaSlider,
  type MediaSliderProps,
} from "@liexp/ui/components/sliders/MediaSlider";
import { useMediaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { type Meta, type Story } from "@storybook/react/types-6-0";
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

const Template: Story<Omit<MediaSliderProps, "media"> & { id: string }> = ({
  id,
  ...props
}) => {
  return (
    <QueriesRenderer
      queries={{
        media: useMediaQuery({}, false),
      }}
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
