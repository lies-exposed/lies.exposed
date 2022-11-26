import { List, ListItem, ListItemText, Typography } from "@mui/material";
import slate from "@react-page/plugins-slate";
import * as React from "react";

export const getLiexpSlate = (custom: any): any => {
  return slate((def) => ({
    ...def,
    id: "eco-slate-plugin",
    title: "@liexp Slate plugin",
    description: "Slate plugin with components used in @liexp.",
    plugins: {
      ...def.plugins,
      headings: {
        h1: def.plugins.headings.h1((h1Def) => ({
          ...h1Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography variant="h1" style={style}>
              {children}
            </Typography>
          ),
        })),
        h2: def.plugins.headings.h2((h2Def) => ({
          ...h2Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography variant="h2" style={style}>
              {children}
            </Typography>
          ),
        })),
        h3: def.plugins.headings.h3((h3Def) => ({
          ...h3Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography variant="h3" style={style}>
              {children}
            </Typography>
          ),
        })),
        h4: def.plugins.headings.h4((h4Def) => ({
          ...h4Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography variant="h4" style={style}>
              {children}
            </Typography>
          ),
        })),
        h5: def.plugins.headings.h5((h5Def) => ({
          ...h5Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography variant="h5" style={style}>
              {children}
            </Typography>
          ),
        })),
        h6: def.plugins.headings.h6((h6Def) => ({
          ...h6Def, // spread it, so that the new config contains all defaults
          Component: ({ style, children }) => (
            <Typography variant="h6" style={style}>
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
            <Typography className={className} variant="body1" style={style}>
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
              {children}
            </ListItem>
          ),
        })),
      },
      custom,
    },

    // other overrides
  }));
};

// export const liexpSlate = getLiexpSlate({});
