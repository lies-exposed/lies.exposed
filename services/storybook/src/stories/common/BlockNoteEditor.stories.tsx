import { BlockNoteView } from "@blocknote/mantine";
import {
  BNEditor,
  BNEditorProps,
} from "@liexp/ui/lib/components/Common/BlockNote/Editor.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Common/BlockNoteEditor",
  component: BlockNoteView,
  argTypes: {},
};

export default meta;

const Template: StoryFn<BNEditorProps> = ({ readOnly, content }) => {
  const [blocks, setBlocks] = React.useState<any[]>(content);
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <BNEditor readOnly={readOnly} content={blocks} onChange={setBlocks} />
    </div>
  );
};

export const BlockNoteEditorExample = Template.bind({});
BlockNoteEditorExample.args = {
  readOnly: false,
  content: [],
};
