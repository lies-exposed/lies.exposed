import { createReactInlineContentSpec } from "@blocknote/react";
import * as React from "react";
import { AutocompleteActorInput } from "../../../../Input/AutocompleteActorInput.js";
import { AutocompleteAreaInput } from "../../../../Input/AutocompleteAreaInput.js";
import { AutocompleteGroupInput } from "../../../../Input/AutocompleteGroupInput.js";
import { AutocompleteKeywordInput } from "../../../../Input/AutocompleteKeywordInput.js";
import {
  IconButton,
  Icons,
  MenuItem,
  Select,
  Stack,
} from "../../../../mui/index.js";
import {
  ActorIcon,
  AreaIcon,
  GroupIcon,
  HashtagIcon,
} from "../../../Icons/FAIcon.js";
import { BlockNoteEditorContext } from "../../BlockNoteEditorContext.js";
import { type BNESchemaEditor } from "../../EditorSchema.js";

// Custom Slash Menu item to insert a block after the current one.
export const relationItem = (editor: BNESchemaEditor) => ({
  title: "Add relation Inline",
  key: 'relation',
  onItemClick: () => {
    // Inserting the content inline
    editor.insertInlineContent([
      {
        type: "relation",
        props: {
          relation: "actor",
          id: undefined as any,
        },
      },
    ]);
  },
  aliases: ["ac", "gr", "kw", "relation", "rel"],
  group: "Relations",
  icon: <Icons.GroupIcon fontSize='small' />,
  subtext: "Used to insert a block with a relation.",
});

export const RelationInlineContentComponent: React.FC<{
  editor: BNESchemaEditor;
  relation?: string;
  relationProps?: any;
  relationRenderer: Record<string, (props: any) => React.ReactNode>;
  id?: string;
}> = ({
  editor,
  relation: _relation,
  relationProps,
  relationRenderer,
  id: _id,
}) => {
  const [{ relation, id }, setRelationProps] = React.useState<{
    relation: string | undefined;
    id: string | undefined;
  }>({ relation: _relation, id: _id });

  const removeItem = React.useCallback(() => {
    const pos = editor.getTextCursorPosition();
    const blockContent = pos.block.content as any[];

    const updatedBlockContent = blockContent.flatMap((t) => {
      const isRelationType = t.type === "relation";
      const isSamePluginRelation = t.type === relation && t.props.id === id;
      return isRelationType || isSamePluginRelation ? [] : [t];
    });

    editor.updateBlock(pos.block, {
      content: updatedBlockContent,
    });
  }, [editor, relation, id]);

  const {
    selectInput,
    autocompleteInput,
    editIcon,
    renderedItem,
    closeButton,
  } = React.useMemo(() => {
    const elements = {
      selectInput: null as React.ReactNode | null,
      autocompleteInput: null as React.ReactNode | null,
      editIcon: null as React.ReactNode | null,
      renderedItem: null as React.ReactNode | null,
      closeButton: null as React.ReactNode | null,
    };

    if (editor.isEditable) {
      elements.editIcon = (
        <IconButton
          onClick={() => {
            setRelationProps({
              relation: undefined,
              id: undefined,
            });
          }}
        >
          <Icons.DragIndicator fontSize={"small"} />
        </IconButton>
      );

      elements.closeButton = (
        <span>
          <IconButton onClick={removeItem}>
            <Icons.Close
              style={{
                fontSize: 9,
              }}
            />
          </IconButton>
        </span>
      );
    }

    if (id) {
      const relationComponent =
        relation &&
        relationRenderer[relation]?.({
          ...relationProps,
        });

      elements.renderedItem = relationComponent ?? (
        <span>Missing {relation} render component</span>
      );

      return elements;
    }

    if (!relation && editor.isEditable) {
      elements.selectInput = (
        <Select
          tabIndex={0}
          value={relation}
          onChange={(e) => {
            setRelationProps({
              id: undefined,
              relation: e.target.value as string,
            });
          }}
          size="small"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 100,
          }}
        >
          <MenuItem value="actor">
            <ActorIcon />
          </MenuItem>
          <MenuItem value="group">
            <GroupIcon />
          </MenuItem>
          <MenuItem value="keyword">
            <HashtagIcon />
          </MenuItem>
          <MenuItem value="area">
            <AreaIcon />
          </MenuItem>
        </Select>
      );
    }

    const autocompleteProps = {
      tabIndex: 1,
      style: {
        display: "inline-flex",
        minWidth: 200,
      },
      size: "small",
      selectedItems: [],
      onChange: (a: any[]) => {
        const currentBlock =
          editor.document.find((tt) =>
            ((tt.content as any) ?? []).find((t: any) => {
              return (
                t.type === "relation" ||
                (t.type === relation &&
                  (t.props.id === undefined || t.props.id === "")) ||
                (t.type === _relation && t.props.id === _id) ||
                (t.type === relation && t.props.id === id)
              );
            }),
          ) ?? editor.getTextCursorPosition().block;

        if (currentBlock) {
          const updatedBlockContent = (currentBlock.content as any[]).map(
            (t) =>
              t.type === "relation" ||
              (t.type === relation &&
                (t.props.id === undefined || t.props.id === "")) ||
              (t.type === _relation && t.props.id === _id) ||
              (t.type === relation && t.props.id === id)
                ? {
                    type: relation as any as "actor",
                    props: {
                      ...relationProps,
                      id: a[0].id,
                    },
                  }
                : t,
          );

          editor.updateBlock(currentBlock, {
            content: updatedBlockContent,
          });

          setRelationProps({ id: a[0].id, relation: relation });
        }
      },
    };

    switch (relation) {
      case "actor":
        elements.autocompleteInput = (
          <AutocompleteActorInput {...autocompleteProps} />
        );
        break;
      case "group":
        elements.autocompleteInput = (
          <AutocompleteGroupInput {...autocompleteProps} />
        );
        break;
      case "keyword":
        elements.autocompleteInput = (
          <AutocompleteKeywordInput {...autocompleteProps} />
        );
        break;
      case "area":
        elements.autocompleteInput = (
          <AutocompleteAreaInput {...autocompleteProps} />
        );
        break;
      default:
        elements.autocompleteInput = (
          <AutocompleteKeywordInput {...autocompleteProps} />
        );
    }
    return elements;
  }, [relation, _relation, id, _id, removeItem]);

  return (
    <Stack direction="row" display="inline-flex">
      {editIcon}
      {selectInput}
      {autocompleteInput}
      {renderedItem}
      {closeButton}
    </Stack>
  );
};

export const relationInlineContentSpec = createReactInlineContentSpec(
  {
    type: "relation",
    propSchema: {
      relation: {
        default: undefined as any as string,
      },
      id: {
        default: undefined as any as string,
      },
    },
    content: "none",
  } as const,
  {
    render: ({
      inlineContent: {
        props: { relation, id },
      },
    }) => {
      return (
        <BlockNoteEditorContext.Consumer>
          {(editor) =>
            editor ? (
              <RelationInlineContentComponent
                editor={editor}
                relation={relation}
                id={id}
                relationProps={{ id }}
                relationRenderer={{}}
              />
            ) : null
          }
        </BlockNoteEditorContext.Consumer>
      );
    },
  },
);
