import { type BuildImageLayer } from "@liexp/shared/lib/io/http/admin/BuildImage.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import * as React from "react";
import {
  ResettableTextField,
  useDataProvider,
  type InputProps,
} from "react-admin";
import SearchableInput from "../../../Input/SearchableInput.js";
import { Box, Button, Grid, Typography } from "../../../mui/index.js";
import { ColorInput } from "../../common/inputs/ColorInput.js";

const toBase64SourceImg = (base64: string): string =>
  `data:image/png;base64,${base64}`;

// type LayerProps = {
//   blend: string;
//   gravity: string;
//   background: Color;
//   textColor: Color;
//   textBackground: Color;
// };

const useLayer = (props: Partial<BuildImageLayer>): [BuildImageLayer, any] => {
  const [layer, setLayer] = React.useState<BuildImageLayer>({
    width: 100,
    height: 100,
    blend: "add",
    gravity: "north",
    background: toColor("000000"),
    type: props.type ?? ("watermark" as any),
    ...props,
  });

  return [layer, setLayer];
};
export const LayerBox: React.FC<{
  layer: BuildImageLayer;
  onLayerChange: (l: BuildImageLayer) => void;
}> = ({ layer, onLayerChange }) => {
  const handleSetLayer = (u: Partial<BuildImageLayer>): void => {
    onLayerChange({
      ...layer,
      ...u,
      type: u.type ?? (layer.type as any),
    });
  };
  return (
    <Box>
      <Typography variant="subtitle2">{layer.type}</Typography>

      <Box>
        <Box>
          <Grid
            container
            spacing={2}
            alignItems={"center"}
            justifyContent={"flex-start"}
          >
            <Grid item md={3} sm={6}>
              <ResettableTextField
                label="width"
                value={layer.width ?? 100}
                type="number"
                onChange={(e) => {
                  handleSetLayer({ width: +e.target.value });
                }}
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              />
            </Grid>
            <Grid item md={3} sm={6}>
              <ResettableTextField
                label="height"
                value={layer.height ?? 100}
                type="number"
                onChange={(e) => {
                  handleSetLayer({ height: +e.target.value });
                }}
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              />
            </Grid>
            <Grid item md={3} sm={6}>
              <SearchableInput
                label="Gravity"
                selectedItems={[{ id: layer.gravity, name: layer.gravity }]}
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
                  if (e) {
                    handleSetLayer({
                      gravity: e.name,
                    });
                  }
                }}
                onUnselectItem={() => {}}
                isOptionEqualToValue={(o, v) => o.id === v.id}
              />
            </Grid>
            <Grid item md={3} sm={6}>
              <SearchableInput
                label="Blend"
                selectedItems={[{ id: layer.blend, name: layer.blend }]}
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
                  if (e) {
                    handleSetLayer({
                      blend: e.name,
                    });
                  }
                }}
                onUnselectItem={() => {}}
                size="small"
              />
            </Grid>
            <Grid item md={6}>
              <ColorInput
                label="background"
                source="background"
                value={layer.background}
                size="small"
                onChange={(e) => {
                  handleSetLayer({
                    background: toColor(e.target.value),
                  });
                }}
              />
            </Grid>
            {layer.type === "text" ? (
              <Grid item md={6}>
                <ColorInput
                  label="textColor"
                  source="color"
                  value={layer.color}
                  size="small"
                  onChange={(e) => {
                    handleSetLayer({
                      color: toColor(e.target.value),
                    });
                  }}
                />
              </Grid>
            ) : null}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export const BuildImageButton: React.FC<
  Omit<InputProps, "source"> & {
    text: string;
    media: string;
    onBuild: (base64: string, base64Source: string) => void;
  }
> = ({ text: postText, media, onBuild, ...props }) => {
  const apiProvider = useDataProvider();
  const [mediaLayer, setMediaLayer] = useLayer({ type: "media", url: media });
  const [text, setText] = useLayer({
    type: "text",
    text: postText,
    color: toColor("000000"),
    gravity: "south",
    height: 18,
  });
  const [watermark, setWatermark] = useLayer({
    type: "watermark",
    gravity: "south",
    height: 10,
    width: 10,
    blend: "over",
  });

  const handleClick = (): void => {
    void apiProvider
      .request({
        method: "POST",
        url: "/admins/images/build",
        data: {
          layers: {
            media: mediaLayer,
            text,
            watermark,
          },
        },
      })
      .then((response: any) => {
        onBuild(response, toBase64SourceImg(response));
      });
  };

  return (
    <Box>
      <LayerBox layer={mediaLayer} onLayerChange={setMediaLayer} />
      <LayerBox layer={text} onLayerChange={setText} />
      <LayerBox layer={watermark} onLayerChange={setWatermark} />
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
  );
};

const GRAVITY_OPTIONS = [
  "north",
  "northwest",
  "northeast",
  "south",
  "southwest",
  "southeast",
  "east",
  "west",
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
