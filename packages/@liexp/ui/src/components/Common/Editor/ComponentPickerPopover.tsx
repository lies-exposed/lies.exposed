// import { useInsertNew } from "@react-page/editor";
import * as React from "react";
import { AutocompleteActorInput } from "../../Input/AutocompleteActorInput";
import { Box, List, ListItem, Typography } from "../../mui";
import { Popover, type PopoverProps } from "../Popover";
import { ACTOR_INLINE } from "./plugins/actor/ActorInline.plugin";

interface Plugin {
  name: string;
  type: string;
}

const PLUGINS = [
  // { name: "paragraph", type: PARAGRAPH_TYPE },
  // { name: "pre", type: PARAGRAPH_PRE_TYPE },
  // { name: "underline", type: EMPHASIZE_U_TYPE },
  // { name: "italic", type: EMPHASIZE_EM_TYPE },
  // { name: "bold", type: EMPHASIZE_STRONG_TYPE },
  { name: "actor", type: ACTOR_INLINE },
];
export const ComponentsPickerPopover: React.FC<
  Omit<PopoverProps, "onClose" | "onSelect"> & {
    onSelect: (p: Plugin & { data: any }) => void;
    onClose: () => void;
  }
> = ({ onClose, open = false, onSelect, ...props }) => {
  // const insert = useInsertNew();
  const anchorElRef = React.createRef<HTMLElement>();
  const [selectedPlugin, setSelectedPlugin] = React.useState<
    Plugin | undefined
  >(undefined);

  const handleClick = (p: any): void => {
    // eslint-disable-next-line no-console
    console.log("handle click", p);
    setSelectedPlugin(p);
  };

  const autocomplete = React.useMemo(() => {
    switch (selectedPlugin?.type) {
      case ACTOR_INLINE: {
        return (
          <AutocompleteActorInput
            selectedItems={[]}
            discrete={false}
            onChange={(d) => {
              if (d[0]) {
                const plugin = { ...selectedPlugin, data: d[0] };
                // eslint-disable-next-line no-console
                console.log({ plugin });
                // insert(plugin);
                // onSelect({ ...selectedPlugin, data: d[0] });
              }
            }}
          />
        );
      }
    }
    return <div>Autocomplete</div>;
  }, [selectedPlugin]);

  return (
    <Box
      style={{
        position: !props.disablePortal ? "fixed" : "relative",
        display: !props.disablePortal ? "inline" : "block",
        background: "red",
        width: !props.disablePortal ? 100 : 0,
        height: !props.disablePortal ? 100 : 0,
      }}
      ref={anchorElRef}
    >
      <Popover
        {...props}
        open={open}
        // anchorEl={anchorElRef.current}
        onClose={() => {
          onClose();
        }}
      >
        {!selectedPlugin ? (
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
        ) : (
          autocomplete
        )}
      </Popover>
    </Box>
  );
};
