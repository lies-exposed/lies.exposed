import {
  MediaBox,
  type MediaBoxProps,
} from "@liexp/ui/lib/containers/MediaBox.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Containers/Media/MediaBox",
  component: MediaBox,
};

export default meta;

const Template: StoryFn<MediaBoxProps> = (props) => {
  return <MediaBox {...props} />;
};

const MediaBoxExample = Template.bind({});

const args: MediaBoxProps = {
  filter: { _order: "DESC", _sort: "updatedAt" },
  perPage: 50,
  onClick(e) {},
};

MediaBoxExample.args = args;

export { MediaBoxExample as MediaBox };
