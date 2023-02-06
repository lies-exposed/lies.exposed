import {
  MediaBox,
  type MediaBoxProps,
} from "@liexp/ui/containers/MediaBox";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/containers/Media/MediaBox",
  component: MediaBox,
};

export default meta;

const Template: Story<MediaBoxProps> = (props) => {
  return <MediaBox {...props} />;
};

const MediaBoxExample = Template.bind({});

const args: MediaBoxProps = {
  filter: { _order: "DESC", _sort: "updatedAt" },
  onClick(e) {},
};

MediaBoxExample.args = args;

export { MediaBoxExample as MediaBox };
