import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { type Cell } from "@react-page/editor/lib/core/types/node.js";
import * as slate from "@react-page/plugins-slate";
import * as React from "react";
import { StoryUtils } from "../../utils/story.utils.js";

// const slt = importDefault<typeof slate>(slate);
const slt = slate;

export const H1_TYPE = "HEADINGS/HEADING-ONE";
export const H2_TYPE = "HEADINGS/HEADING-TWO";
export const H3_TYPE = "HEADINGS/HEADING-THREE";
export const H4_TYPE = "HEADINGS/HEADING-FOUR";
export const H5_TYPE = "HEADINGS/HEADING-FIVE";
export const H6_TYPE = "HEADINGS/HEADING-SIX";
export const PARAGRAPH_TYPE = "PARAGRAPH/PARAGRAPH";
export const PARAGRAPH_PRE_TYPE = "PARAGRAPH/PRE";
export const EMPHASIZE_EM_TYPE = "EMPHASIZE/EM";
export const EMPHASIZE_STRONG_TYPE = "EMPHASIZE/STRONG";
export const EMPHASIZE_U_TYPE = "EMPHASIZE/U";
export const BLOCKQUOTE_TYPE = "BLOCKQUOTE/BLOCKQUOTE";

export const LIEXP_SLATE_PLUGIN_ID = "eco-slate-plugin";
export const LINK_INLINE = "liexp/link/inline";
export const ACTOR_INLINE = "liexp/actor/inline";
export const GROUP_INLINE = "liexp/group/inline";
export const KEYWORD_INLINE = "liexp/keyword/inline";
export const MEDIA_BLOCK_PLUGIN = "liexp/editor/plugins/mediaBlock";
export const EVENT_BLOCK_PLUGIN = "liexp/editor/plugins/EventBlock";
export const COMPONENT_PICKER_POPOVER_PLUGIN =
  "liexp/plugin/component-picker-popover";

const getHeaderId = (children: React.ReactNode): string | undefined => {
  return pipe(
    fp.E.tryCatch(() => {
      const c: any = children ?? {};
      // console.log(c?.props, );
      return StoryUtils.convertTitleToId(c.props.children[0].text);
    }, fp.E.toError),
    fp.O.fromEither,
    fp.O.toUndefined,
  );
};

export const getLiexpSlate = (custom: any): slate.SlateCellPlugin<any> => {
  return slt.default((def) => ({
    ...def,
    id: LIEXP_SLATE_PLUGIN_ID,
    title: "@liexp Slate plugin",
    description: "Slate plugin with components used in @liexp.",
    plugins: {
      ...def.plugins,
      headings: {
        h1: def.plugins.headings.h1((h1Def) => ({
          ...h1Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children, attributes }) => (
            <Typography
              id={getHeaderId(children)}
              variant="h1"
              style={style}
              {...attributes}
            >
              {children}
            </Typography>
          ),
        })),
        h2: def.plugins.headings.h2((h2Def) => ({
          ...h2Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography id={getHeaderId(children)} variant="h2" style={style}>
              {children}
            </Typography>
          ),
        })),
        h3: def.plugins.headings.h3((h3Def) => ({
          ...h3Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography id={getHeaderId(children)} variant="h3" style={style}>
              {children}
            </Typography>
          ),
        })),
        h4: def.plugins.headings.h4((h4Def) => ({
          ...h4Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography id={getHeaderId(children)} variant="h4" style={style}>
              {children}
            </Typography>
          ),
        })),
        h5: def.plugins.headings.h5((h5Def) => ({
          ...h5Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography id={getHeaderId(children)} variant="h5" style={style}>
              {children}
            </Typography>
          ),
        })),
        h6: def.plugins.headings.h6((h6Def) => ({
          ...h6Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography id={getHeaderId(children)} variant="h6" style={style}>
              {children}
            </Typography>
          ),
        })),
      },
      paragraphs: {
        ...def.plugins.paragraphs /* make sure to always include that */,
        paragraph: def.plugins.paragraphs.paragraph((pDef) => ({
          ...pDef, // spread it, so that the new config contains all defaults
          Component: ({ className, style, children }) => (
            <Typography
              className={className}
              variant="body1"
              style={{ ...style, display: "inline-block", marginBottom: 20 }}
            >
              {children}
            </Typography>
          ),
        })),
      },
      lists: {
        ...def.plugins.lists,
        ul: def.plugins.lists.ul<any>({
          customizeList: (listDef) => ({
            ...listDef,
            Component: ({ className, style, children }) => (
              <List className={className} style={style}>
                {children}
              </List>
            ),
          }),
          customizeListItem: (listItemDef) => ({
            ...listItemDef,
            Component: ({ className, style, children }) => (
              <ListItem className={className} style={style}>
                <ListItemText>{children}</ListItemText>
              </ListItem>
            ),
          }),
        }),
        li: def.plugins.lists.li((liDef) => ({
          ...liDef,
          Component: ({ className, style, children }) => (
            <ListItem className={className} style={style}>
              <ListItemText>{children}</ListItemText>
            </ListItem>
          ),
        })),
      },
      quotes: {
        blockquote: def.plugins.quotes.blockQuote((blockQuoteDef) => ({
          ...blockQuoteDef,
          Component: ({ className, style, children }) => (
            <blockquote
              className={className}
              style={{
                borderLeft: 3,
                borderLeftColor: "red",
                borderLeftStyle: "solid",
                padding: 20,
                marginLeft: 0,
                ...style,
              }}
            >
              {children}
            </blockquote>
          ),
        })),
      },
      code: {
        ...def.plugins.code,
        mark: def.plugins.code?.mark((codeDef) => ({
          ...codeDef, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <code style={{ ...style, background: "#eee", color: "#17B9B6" }}>
              {children}
            </code>
          ),
        })),
      },
      custom,
    },

    // other overrides
  }));
};

// export const liexpSlate = getLiexpSlate({});

export const isSlatePlugin = (c: Cell): boolean => {
  return c.plugin?.id === LIEXP_SLATE_PLUGIN_ID;
};

export const isMediaBlockCell = (c: Cell): boolean => {
  return c.plugin?.id === MEDIA_BLOCK_PLUGIN;
};

export const isEventBlockCell = (c: Cell): boolean => {
  return c.plugin?.id === EVENT_BLOCK_PLUGIN;
};
