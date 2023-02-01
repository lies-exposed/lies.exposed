import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useMediaQuery } from "@liexp/ui/state/queries/media.queries";
import {
  MediaTemplateUI,
  type MediaTemplateUIProps
} from "@liexp/ui/templates/MediaTemplateUI";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Media/Page",
  component: MediaTemplateUI,
};

export default meta;

const Template: Story<MediaTemplateUIProps> = (props) => {
  

  return (
    <QueriesRenderer
      queries={{
        media: useMediaQuery(
          {
            pagination: { perPage: 1, page: 1 },
          },
          false
        ),
      }}
      render={({ media: { data } }) => {
        return (
          <MediaTemplateUI
            {...props}
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
