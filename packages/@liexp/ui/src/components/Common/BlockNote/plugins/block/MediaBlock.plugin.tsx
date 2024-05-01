import { insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { UUID } from "io-ts-types/lib/UUID.js";
import * as React from "react";
import MediaSliderBox from "../../../../../containers/MediaSliderBox.js";
import { AutocompleteMediaInput } from "../../../../Input/AutocompleteMediaInput.js";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Icons,
  Input,
  Stack,
} from "../../../../mui/index.js";
import { BNESchemaEditor } from "../../EditorSchema.js";
import { EditMenu } from "../EditMenu/EditMenu.js";

interface MediaBlockProps {
  ids: string;
  enableDescription: boolean;
  height: number;
}

const DEFAULT_ID = "missing-id";

// Slash menu item to insert an Alert block
export const insertMedia = (editor: BNESchemaEditor) => ({
  title: "Media",
  subtext: "Insert a media block",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "media",
      props: {
        ids: DEFAULT_ID,
        enableDescription: false,
        height: 100,
      },
    });
  },
  aliases: ["video", "pdf", "media", "image", "photo"],
  group: "Media",
  icon: <Icons.MediaIcon fontSize="small" />,
});

export const MediaBlockPluginRenderer: React.FC<{
  data: MediaBlockProps;
}> = ({ ...props }) => {
  const ids = props.data?.ids.split(",").filter(UUID.is) ?? [];
  const height = props.data.height ?? 200;
  const enableDescription = props.data.enableDescription ?? false;

  if (ids.length > 0) {
    return (
      <Box style={{ width: "100%", maxWidth: 1400, flexGrow: 0 }}>
        <MediaSliderBox
          enableDescription={enableDescription}
          disableZoom={false}
          query={{
            filter: { ids: ids },
            pagination: { page: 1, perPage: ids.length },
            sort: {
              field: "id",
              order: "ASC",
            },
          }}
          itemStyle={() => ({ height })}
        />
      </Box>
    );
  }

  return <div>Select a media...</div>;
};

export const MediaBlockPluginControl: React.FC<{
  data: MediaBlockProps;
  onRemove: () => void;
  onChange: (data: MediaBlockProps) => void;
}> = ({ onRemove: remove, data, ...props }) => {
  const [s, setS] = React.useState({
    media:
      data.ids?.split(",").flatMap((id) => (UUID.is(id) ? [{ id }] : [])) ?? [],
    height: data.height ?? 200,
    enableDescription: data.enableDescription ?? false,
  });

  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s.media ? s.media : []),
    [s.media],
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
          <AutocompleteMediaInput
            discrete={false}
            selectedItems={selectedItems}
            onChange={(items) => {
              setS({ ...s, media: items });
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
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                color="info"
                disabled={false}
                size="small"
                checked={s.enableDescription}
                onChange={(v, c) => {
                  setS({
                    ...s,
                    enableDescription: c,
                  });
                }}
              />
            }
            label="Enable description?"
          />
        </Grid>

        <Grid item xs={12} sm={12} md={12}>
          <IconButton
            size="small"
            disabled={s.media.length < 1}
            onClick={() => {
              props.onChange({
                ...s,
                ids: s.media.map((m) => m.id).join(","),
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

export const mediaBlock = createReactBlockSpec(
  {
    type: "media",
    propSchema: {
      ids: {
        default: DEFAULT_ID,
      },
      enableDescription: {
        default: false,
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
        props: { ids, enableDescription, height },
      },
      editor,
    }): React.ReactNode => {
      const currentCursor = editor.getTextCursorPosition();

      const onRemove = () => {
        editor.removeBlocks([currentCursor.block]);
      };

      const onChange = ({ ...mediaBlockProps }: MediaBlockProps): void => {
        insertOrUpdateBlock(editor, {
          type: "media",
          props: { ...mediaBlockProps },
        });
      };

      return (
        <Stack direction="column">
          <EditMenu
            editor={editor as any}
            onClick={() => {
              onChange({
                ids: DEFAULT_ID,
                enableDescription: false,
                height: 100,
              });
            }}
          >
            {ids === DEFAULT_ID ? (
              <MediaBlockPluginControl
                onRemove={onRemove}
                data={{ ids: "", enableDescription: false, height: 100 }}
                onChange={onChange}
              />
            ) : (
              <MediaBlockPluginRenderer
                data={{ ids, enableDescription, height }}
              />
            )}
          </EditMenu>
        </Stack>
      );
    },
  },
);
