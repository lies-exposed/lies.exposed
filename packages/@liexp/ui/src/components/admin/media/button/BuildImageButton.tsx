import { toColor } from "@liexp/shared/lib/utils/colors";
import * as React from "react";
import { useDataProvider, type InputProps } from "react-admin";
import SearchableInput from "../../../Input/SearchableInput";
import { Box, Button } from "../../../mui";
import { ColorInput } from "../../common/inputs/ColorInput";

const toBase64SourceImg = (base64: string): string =>
  `data:image/png;base64,${base64}`;

export const BuildImageButton: React.FC<
  Omit<InputProps, "source"> & {
    text: string;
    media: string;
    onBuild: (base64: string, base64Source: string) => void;
  }
> = ({ text, media, onBuild, ...props }) => {
  const apiProvider = useDataProvider();
  const [{ blend, gravity, background, textColor }, setTextLayerOptions] =
    React.useState({
      blend: "add",
      gravity: "north",
      textColor: toColor("ffffff"),
      background: toColor("000000"),
    });

  const handleClick = (): void => {
    void apiProvider
      .request({
        method: "POST",
        url: "/admins/images/build",
        data: {
          text,
          media,
          textBlend: blend,
          textGravity: gravity,
          background,
        },
      })
      .then((response: any) => {
        onBuild(response, toBase64SourceImg(response));
      });
  };

  return (
    <Box>
      <Box>
        <SearchableInput
          label="Gravity"
          selectedItems={[{ id: gravity, name: gravity }]}
          getValue={(v) => {
            return typeof v === "string"
              ? v
              : Array.isArray(v)
              ? (v as any)[0].name
              : v.name;
          }}
          items={GRAVITY_OPTIONS.map((c) => ({
            id: c,
            name: c,
          }))}
          onSelectItem={(e, items) => {
            setTextLayerOptions((s) => ({
              ...s,
              gravity: e.name,
            }));
          }}
          onUnselectItem={() => {}}
          isOptionEqualToValue={(o, v) => o.id === v.id}
        />
      </Box>
      <Box>
        <SearchableInput
          label="Blend"
          selectedItems={[{ id: blend, name: blend }]}
          getValue={(v) => {
            return typeof v === "string"
              ? v
              : Array.isArray(v)
              ? (v as any)[0].name
              : v.name;
          }}
          items={BLEND_OPTIONS.map((c) => ({ id: c, name: c }))}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          onSelectItem={(e) => {
            setTextLayerOptions((s) => ({
              ...s,
              blend: e.name,
            }));
          }}
          onUnselectItem={() => {}}
        />
      </Box>
      <Box>
        <ColorInput
          source="color"
          value={background}
          onChange={(e) => {
            setTextLayerOptions((s) => ({
              ...s,
              background: toColor(e.target.value),
            }));
          }}
        />
        <ColorInput
          source="textColor"
          value={textColor}
          onChange={(e) => {
            setTextLayerOptions((s) => ({
              ...s,
              textColor: toColor(e.target.value),
            }));
          }}
        />
        <Button
          variant="contained"
          disabled={!text || !media}
          onClick={() => {
            handleClick();
          }}
        >
          Build image
        </Button>
      </Box>
    </Box>
  );
};

const GRAVITY_OPTIONS = [
  "north",
  "northwest",
  "northeast",
  "south",
  "southwest",
  "southeast",
];

const BLEND_OPTIONS = [
  "clear",
  "source",
  "over",
  "in",
  "out",
  "atop",
  "dest",
  "dest-over",
  "dest-in",
  "dest-out",
  "dest-atop",
  "xor",
  "add",
  "saturate",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "colour-dodge",
  "color-burn",
  "colour-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
];
