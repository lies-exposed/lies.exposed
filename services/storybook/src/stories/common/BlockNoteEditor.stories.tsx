import {
  BNEditor,
  type BNEditorProps,
} from "@liexp/ui/lib/components/Common/BlockNote/index.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Components/Common/BlockNoteEditor",
  component: BNEditor,
  argTypes: {},
};

export default meta;

const Template: StoryFn<BNEditorProps> = ({ readOnly, content }) => {
  const [blocks, setBlocks] = React.useState(content ?? []);
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <BNEditor readOnly={readOnly} content={blocks} onChange={setBlocks} />
    </div>
  );
};

export const BlockNoteEditorExample = {
  render: Template,

  args: {
    readOnly: false,
    content: [],
  },
};
