import Editor from "@liexp/ui/lib/components/Common/Editor";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Common/Editor",
  component: Editor,
  argTypes: {},
};

export default meta;

const Template: StoryFn<any> = (props) => {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Editor readOnly={false} value={null} />
    </div>
  );
};

export const EditorExample = Template.bind({});
EditorExample.args = {};
