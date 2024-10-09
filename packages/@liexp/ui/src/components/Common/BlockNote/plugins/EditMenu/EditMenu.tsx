import * as React from "react";
import { IconButton, Icons, Stack } from "../../../../mui/index.js";
import { type BNESchemaEditor } from "../../EditorSchema.js";

// Custom Slash Menu item to insert a block after the current one.
export const relationItem = (editor: BNESchemaEditor) => ({
  title: "Add relation Inline",
  onItemClick: () => {
    // Inserting the content inline
    editor.insertInlineContent([
      {
        type: "relation",
        props: {
          relation: "actor",
          id: undefined,
        },
      } as any,
    ]);
  },
  aliases: ["ac", "gr", "kw", "relation", "rel"],
  group: "Relations",
  icon: <Icons.GroupIcon />,
  subtext: "Used to insert a block with a relation.",
});

export const EditMenu: React.FC<
  React.PropsWithChildren<{
    editor: BNESchemaEditor;
    relation?: string;
    onClick: () => void;
  }>
> = ({ editor, relation: _relation, onClick, children }) => {
  const content = React.useMemo(() => {
    if (editor.isEditable) {
      return (
        <Stack
          direction="row"
          display="inline-flex"
          justifyItems={"flex-start"}
        >
          <Stack direction="column">
            <IconButton
              onClick={() => {
                onClick();
              }}
              style={{
                marginRight: 8,
              }}
            >
              <Icons.DragIndicator fontSize={"small"} />
            </IconButton>
          </Stack>
          {children}
        </Stack>
      );
    }

    return children;
  }, [onClick, editor.isEditable]);

  return content;
};
