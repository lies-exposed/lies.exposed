import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/index.js";
import { Schema } from "effect";
import * as React from "react";
import { LinksBox } from "../../../../../containers/link/LinksBox.js";
import { AutocompleteLinkInput } from "../../../../Input/AutocompleteLinkInput.js";
import {
  Box,
  Grid,
  IconButton,
  Icons,
  Input,
  Stack,
} from "../../../../mui/index.js";
import { EditMenu } from "../EditMenu/EditMenu.js";

interface LinkBlockProps {
  id: string;
  height: number;
}

export const LINK_BLOCK_PLUGIN_TYPE = "liexp-link-block";

const DEFAULT_ID = "missing-id";

// Slash menu item to insert an Alert block
export const insertLinkBlock = (editor: BNESchemaEditor) => ({
  title: "Link Block",
  key: "link-block-1",
  subtext: "Insert a Link block",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: LINK_BLOCK_PLUGIN_TYPE,
      props: {
        id: DEFAULT_ID,
        height: 100,
      },
    });
  },
  aliases: ["link"],
  group: "Blocks",
  icon: <Icons.LinkIcon fontSize="small" />,
});

export const LinkBlockPluginRenderer: React.FC<{
  data: LinkBlockProps;
}> = ({ ...props }) => {
  const ids = props.data?.id.split(",").filter(Schema.is(UUID)) ?? [];
  const height = props.data.height ?? 200;

  if (ids.length > 0) {
    return (
      <Box style={{ width: "100%", maxWidth: 1400, flexGrow: 0 }}>
        <LinksBox
          filter={{
            ids: ids,
          }}
          onItemClick={() => {}}
          style={{ width: "100%", height: height }}
        />
      </Box>
    );
  }

  return <div>Select a media...</div>;
};

export const LinkBlockPluginControl: React.FC<{
  data: LinkBlockProps;
  onRemove: () => void;
  onChange: (data: LinkBlockProps) => void;
}> = ({ onRemove: remove, data, ...props }) => {
  const [s, setS] = React.useState({
    links:
      data.id?.split(",").flatMap((id) => (UUID.is(id) ? [{ id }] : [])) ?? [],
    height: data.height ?? 200,
  });

  const selectedItems = React.useMemo(
    () => (s.links ? s.links : []),
    [s.links],
  );

  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12}>
          <AutocompleteLinkInput
            discrete={false}
            selectedItems={selectedItems as any[]}
            onChange={(items) => {
              setS({ ...s, links: items });
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <Input
            value={s.height}
            onChange={(e) => {
              setS({ ...s, height: +e.currentTarget.value });
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <IconButton
            size="small"
            disabled={s.links.length < 1}
            onClick={() => {
              props.onChange({
                ...s,
                id: s.links.map((m) => m.id).join(","),
              });
            }}
          >
            <Icons.AddCircle />
          </IconButton>
          <IconButton
            onClick={() => {
              remove?.();
            }}
          >
            <Icons.Cancel />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export const linkBlock = createReactBlockSpec(
  {
    type: LINK_BLOCK_PLUGIN_TYPE,
    propSchema: {
      id: {
        default: DEFAULT_ID,
      },
      height: {
        default: 150,
      },
    },
    content: "inline",
  },
  {
    render: ({
      block: {
        props: { id, height },
      },
      editor,
    }): React.ReactNode => {
      const currentCursor = editor.getTextCursorPosition();

      const onRemove = () => {
        editor.removeBlocks([currentCursor.block]);
      };

      const onChange = ({ ...mediaBlockProps }: LinkBlockProps): void => {
        insertOrUpdateBlock(editor, {
          ...currentCursor,
          type: LINK_BLOCK_PLUGIN_TYPE,
          props: { ...mediaBlockProps },
        });
      };

      return (
        <Stack direction="column" width={"100%"}>
          <EditMenu
            editor={editor as any}
            onClick={() => {
              onChange({
                id: DEFAULT_ID,
                height: 100,
              });
            }}
          >
            {editor.isEditable ? (
              <LinkBlockPluginControl
                onRemove={onRemove}
                data={{ id, height }}
                onChange={onChange}
              />
            ) : (
              <LinkBlockPluginRenderer data={{ id, height }} />
            )}
          </EditMenu>
        </Stack>
      );
    },
  },
);
