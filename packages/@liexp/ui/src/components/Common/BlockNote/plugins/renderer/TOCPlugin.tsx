import { fp } from "@liexp/core/lib/fp/index.js";
import { StoryUtils } from "@liexp/shared/lib/utils/story.utils.js";
import { type Option } from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { styled } from "../../../../../theme/index.js";
import { Box, List, ListItem, Typography } from "../../../../mui/index.js";
import { BNESchemaEditor, BNBlock } from "../../EditorSchema.js";
import { transform } from "../../utils/transform.utils.js";

interface SerializedHeader {
  text: string;
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

const headersSerializer = (c: BNBlock): Option<SerializedHeader[]> => {
  switch (c.type) {
    case "heading": {
      const cc = c as any
      const text = cc.content[0]?.text ?? "Missing heading text";
      return fp.O.some([{ text, type: c.type, level: c.props.level ?? 6 }]);
    }
    default:
      // eslint-disable-next-line no-console
      // console.log("header not handled", c);
      return fp.O.none;
  }
};

const extractHeaders = (
  v: BNESchemaEditor["document"],
): SerializedHeader[] | null => {
  return transform(v, headersSerializer);
};

const serializeToTypography = (
  value: BNESchemaEditor["document"],
): [string, React.ReactNode][] => {
  return pipe(
    extractHeaders(value),
    fp.O.fromNullable,
    fp.O.getOrElse((): SerializedHeader[] => []),
    fp.A.map((h) => {
      let component = <Typography variant="h1">{h.text}</Typography>;
      switch (h.level) {
        case 2: {
          component = <Typography variant="h2">{h.text}</Typography>;
          break;
        }
        case 3: {
          component = <Typography variant="h3">{h.text}</Typography>;
          break;
        }
        case 4: {
          component = <Typography variant="h4">{h.text}</Typography>;
          break;
        }
        case 5: {
          component = <Typography variant="h5">{h.text}</Typography>;
          break;
        }
        case 6: {
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
  value: BNESchemaEditor["document"];
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
