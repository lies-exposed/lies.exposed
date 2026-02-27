import { createReactInlineContentSpec } from "@blocknote/react";
import {
  type BNESchemaEditor,
  linkEntityInlineSpec,
} from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import { Chip, Icons, Tooltip } from "../../../../mui/index.js";

// Slash menu item to insert an existing link entity inline (by ID selection)
export const linkEntityItem = (editor: BNESchemaEditor) => ({
  title: "Add Link Inline",
  key: "link-entity",
  onItemClick: () => {
    editor.insertInlineContent([
      {
        type: "link-entity",
        props: {
          id: undefined as any,
          url: "",
          title: "",
        },
      },
    ]);
  },
  aliases: ["link-entity", "le"],
  group: "Relations",
  icon: <Icons.LinkIcon fontSize="small" />,
  subtext: "Insert an inline chip for a registered link entity.",
});

export const linkEntityInlineContentSpec = createReactInlineContentSpec(
  linkEntityInlineSpec,
  {
    render: ({
      inlineContent: {
        props: { url, title },
      },
    }): React.ReactNode => {
      const displayText = title || url || "link";
      return (
        <Tooltip title={url}>
          <Chip
            size="small"
            icon={<Icons.LinkIcon style={{ fontSize: 12 }} />}
            label={displayText}
            component="span"
            style={{ cursor: "pointer", verticalAlign: "middle" }}
          />
        </Tooltip>
      );
    },
  },
);
