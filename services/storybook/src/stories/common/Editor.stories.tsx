import { editor } from "@liexp/ui/lib/components/Common/Editor/index.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Common/Editor",
  component: editor.Editor,
  argTypes: {},
};

export default meta;

const Template: StoryFn<any> = (props) => {
  const editorNode = React.useMemo(() => {
    return (
      <editor.Editor
        readOnly={false}
        value={editor.createExcerptValue("default value")}
      />
    );
  }, []);
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div>not a real editor</div>
      {editorNode}
    </div>
  );
};

export const EditorExample = Template.bind({});
EditorExample.args = {};
