import {
  LexicalEditor,
  LexicalEditorProps,
} from "@liexp/ui/lib/components/Common/LexicalEditor";
import { type Meta, type StoryFn } from "@storybook/react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $createLineBreakNode,
} from "lexical";
import * as React from "react";

const meta: Meta = {
  title: "Components/Common/LexicalEditor",
  component: LexicalEditor,
  argTypes: {},
};

export default meta;

const Template: StoryFn<LexicalEditorProps> = (props) => {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <LexicalEditor {...props} />
    </div>
  );
};

export const EditorExample = Template.bind({});
EditorExample.args = {
  readOnly: false,
  richText: true,
  debug: true,
  value: (editor) => {
    const root = $getRoot();
    if (root.getFirstChild() === null) {
      const p = $createParagraphNode();
      p.append($createTextNode("Default paragraph text 1"));
      p.append($createLineBreakNode());
      p.append($createTextNode("Default paragraph text 2"));
      root.append(p);

      // root.append(
      //   $createMediaNode({ id: "35a7d589-f4b2-4133-b1fc-689c4c8c5293" })
      // );
    }

    return root;
  },
};
