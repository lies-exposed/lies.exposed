import { fp } from "@liexp/core/lib/fp";
import {
  EMPHASIZE_EM_TYPE,
  EMPHASIZE_STRONG_TYPE,
  EMPHASIZE_U_TYPE,
  PARAGRAPH_PRE_TYPE,
  PARAGRAPH_TYPE,
} from "@liexp/shared/lib/slate/plugins/customSlate";
import {
  getTextContents,
  useInsertNew,
  useValueNode,
} from "@react-page/editor";
import { pipe } from "fp-ts/lib/function";
import { isHotkey } from "is-hotkey";
import * as React from "react";
import { usePopover } from "../../../hooks/usePopover";
import { Box, List, ListItem, Typography } from "../../mui";
import { cellPlugins } from "./cellPlugins";
import { ACTOR_INLINE } from "./plugins/actor/ActorInline";

const HOT_KEY = "ctrl+/";
const isSelectionHotKey = isHotkey(HOT_KEY);

const PLUGINS = [
  { name: "paragraph", type: PARAGRAPH_TYPE },
  { name: "pre", type: PARAGRAPH_PRE_TYPE },
  { name: "underline", type: EMPHASIZE_U_TYPE },
  { name: "italic", type: EMPHASIZE_EM_TYPE },
  { name: "bold", type: EMPHASIZE_STRONG_TYPE },
  { name: "actor", type: ACTOR_INLINE },
];
export const ComponentsPickerPopover: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {

  const anchorElRef = React.createRef<HTMLElement>();

  const insert = useInsertNew();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [popover, showPopover] = usePopover({
    anchorEl,
    // anchorOrigin: { vertical: "top", horizontal: "left" },
    // transformOrigin: {
    //   vertical: "top",
    //   horizontal: "left",
    // },
  });

  const v = useValueNode((v) =>
    v
      ? getTextContents(
          {
            ...v,
            rows: pipe(
              fp.A.last(v.rows),
              fp.O.map((v) => [v]),
              fp.O.getOrElse((): any[] => [])
            ),
          },
          { cellPlugins, lang: "en" }
        ).join("")
      : null
  );

  // console.log(v);

  const handleShowPopover = (): void => {
    // blur();

    showPopover("Pick component", (onClosePopover) => {
      const handleClick = (p: any): void => {
        // eslint-disable-next-line no-console
        console.log("handle click", p);

        insert({ plugin: p.type });
        onClosePopover();
        onClose();
      };

      return (
        <List>
          {PLUGINS.map((p) => (
            <ListItem
              key={p.type}
              onClick={() => {
                handleClick(p);
              }}
            >
              <Typography variant="subtitle2">{p.name}</Typography>
            </ListItem>
          ))}
        </List>
      );
    });
  };

  React.useEffect(() => {
    if (v?.startsWith("/")) {
      handleShowPopover();
    }
  }, [v]);

  React.useEffect(() => {
    if (anchorElRef.current) {
      setAnchorEl(anchorElRef.current);
    }

    const keyHandler = (e: any): void => {
      if (isSelectionHotKey(e)) {
        handleShowPopover();
      }
    };

    document.addEventListener("keydown", keyHandler);

    return () => {
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  return (
    <Box
      style={{
        position: "relative",
        display: "inline",
        background: "red",
        width: 5,
      }}
    >
      <span ref={anchorElRef} />
      {open ? popover : null}
    </Box>
  );
};
