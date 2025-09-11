import {
  MediaBox,
  type MediaBoxProps,
} from "@liexp/ui/lib/containers/MediaBox.js";
import { type Meta } from "@storybook/react-vite";

const meta: Meta = {
  title: "Containers/Media/MediaBox",
  component: MediaBox,
} satisfies Meta<MediaBoxProps>;

export default meta;

export const MediaBoxExample = {
  args: {
    filter: { _order: "DESC", _sort: "updatedAt" },
    perPage: 50,
    onClick() {},
  },
};
