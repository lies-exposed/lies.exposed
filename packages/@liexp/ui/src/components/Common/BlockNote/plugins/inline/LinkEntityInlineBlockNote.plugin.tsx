import { createReactInlineContentSpec } from "@blocknote/react";
import { linkEntityInlineSpec } from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import { Chip, Icons, Tooltip } from "../../../../mui/index.js";

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
