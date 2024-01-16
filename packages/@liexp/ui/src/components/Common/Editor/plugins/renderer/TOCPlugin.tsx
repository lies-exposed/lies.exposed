import { fp } from "@liexp/core/lib/fp/index.js";
import {
  H1_TYPE,
  H2_TYPE,
  H3_TYPE,
  H4_TYPE,
  H5_TYPE,
  H6_TYPE,
  isSlatePlugin,
} from "@liexp/shared/lib/slate/plugins/customSlate.js";
import { StoryUtils } from "@liexp/shared/lib/utils/story.utils.js";
import { type Cell, type Row, type Value } from "@react-page/editor/lib-es/index.js";
import { type SlateComponentPluginDefinition } from "@react-page/plugins-slate/lib/types/slatePluginDefinitions.js";
import { type Option } from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { styled } from "../../../../../theme/index.js";
import { Box, List, ListItem, Typography } from "../../../../mui/index.js";

interface SerializedHeader {
  text: string;
  type:
    | typeof H1_TYPE
    | typeof H2_TYPE
    | typeof H3_TYPE
    | typeof H4_TYPE
    | typeof H5_TYPE
    | typeof H6_TYPE;
}

const deserializeCell = (c: Cell): Option<SerializedHeader[]> => {
  if (c.dataI18n?.en?.slate && isSlatePlugin(c)) {
    const plugins: Array<SlateComponentPluginDefinition<any>> = c.dataI18n.en
      .slate as any;

    return pipe(
      plugins.map((p) => {
        switch (p.type) {
          case H1_TYPE:
          case H2_TYPE:
          case H3_TYPE:
          case H4_TYPE:
          case H5_TYPE:
          case H6_TYPE: {
            // console.log(p);
            const children: any[] = (p as any).children ?? [];
            return fp.O.some({ text: children?.[0]?.text, type: p.type });
          }
          default:
            // eslint-disable-next-line no-console
            // console.log(p);
            return fp.O.none;
        }
      }),
      fp.A.filter(fp.O.isSome),
      fp.A.sequence(fp.O.Applicative),
    );
  }

  return pipe(extractHeaders({ rows: c.rows ?? [] }), fp.O.fromNullable);
};

const deserializeRow = (r: Row): SerializedHeader[] => {
  return pipe(r.cells, fp.A.map(deserializeCell), fp.A.compact, fp.A.flatten);
};

const extractHeaders = (v: { rows: Row[] }): SerializedHeader[] | null => {
  if (v.rows.length === 0) {
    return null;
  }

  return pipe(v.rows, fp.A.map(deserializeRow), fp.A.flatten);
};

const serializeToTypography = (
  value: Value,
): Array<[string, React.ReactNode]> => {
  return pipe(
    extractHeaders(value),
    fp.O.fromNullable,
    fp.O.getOrElse((): SerializedHeader[] => []),
    fp.A.map((h) => {
      let component = <Typography variant="h1">{h.text}</Typography>;
      switch (h.type) {
        case H2_TYPE: {
          component = <Typography variant="h2">{h.text}</Typography>;
          break;
        }
        case H3_TYPE: {
          component = <Typography variant="h3">{h.text}</Typography>;
          break;
        }
        case H4_TYPE: {
          component = <Typography variant="h4">{h.text}</Typography>;
          break;
        }
        case H5_TYPE: {
          component = <Typography variant="h5">{h.text}</Typography>;
          break;
        }
        case H6_TYPE: {
          component = <Typography variant="h6">{h.text}</Typography>;
          break;
        }
      }
      return [StoryUtils.convertTitleToId(h.text), component];
    }),
  );
};

const PREFIX = `toc-plugin`;

const classes = {
  root: `${PREFIX}-root`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    // position: 'sticky',
    padding: 20,
    ".MuiTypography-root": {
      cursor: "pointer",
    },
    " .MuiTypography-h1": {
      fontSize: theme.spacing(2.8),
      marginBottom: theme.spacing(1),
    },
    " .MuiTypography-h2": {
      fontSize: theme.spacing(2.4),
      paddingLeft: theme.spacing(0.8),
      marginBottom: theme.spacing(1),
    },
    " .MuiTypography-h3": {
      fontSize: theme.spacing(2),
      paddingLeft: theme.spacing(1.2),
      marginBottom: theme.spacing(1),
    },
    " .MuiTypography-h4": {
      fontSize: theme.spacing(1.6),
      paddingLeft: theme.spacing(1.6),
      marginBottom: theme.spacing(1),
    },
    " .MuiTypography-h5": {
      fontSize: theme.spacing(1.2),
      paddingLeft: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    " .MuiTypography-h6": {
      fontSize: theme.spacing(0.8),
      paddingLeft: theme.spacing(2.4),
      marginBottom: theme.spacing(1),
    },
  },
}));

interface TOCRendererProps {
  value: Value;
  onClick?: (key: string) => void;
}

export const TOCRenderer: React.FC<TOCRendererProps> = ({
  value,
  onClick: _onClick,
}) => {
  const v = React.useMemo(() => pipe(serializeToTypography(value)), [value]);

  const onClick = React.useCallback(
    (key: string) => {
      if (_onClick) {
        _onClick(key);
      } else {
        const header = document.getElementById(key);
        if (header) {
          header.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [_onClick],
  );

  return v ? (
    <List>
      {v.map(([key, component], i) => {
        return (
          <ListItem
            key={`${key}-${i}`}
            onClick={() => {
              onClick(key);
            }}
          >
            {component}
          </ListItem>
        );
      })}
    </List>
  ) : null;
};

export const TOCPlugin: React.FC<TOCRendererProps> = ({ value, onClick }) => {
  return (
    <StyledBox className={classes.root}>
      <TOCRenderer value={value} onClick={onClick} />
    </StyledBox>
  );
};
