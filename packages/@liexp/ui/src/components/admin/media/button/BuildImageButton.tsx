import { type BuildImageLayer } from "@liexp/io/lib/http/admin/BuildImage.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import * as React from "react";
import {
  ResettableTextField,
  useDataProvider,
  type InputProps,
} from "react-admin";
import SearchableInput from "../../../Input/SearchableInput.js";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  Icons,
  Typography,
} from "../../../mui/index.js";
import { ColorInput } from "../../common/inputs/ColorInput.js";

const toBase64SourceImg = (base64: string): string =>
  `data:image/png;base64,${base64}`;

const useLayer = (
  props: Partial<BuildImageLayer>,
): [BuildImageLayer, React.Dispatch<React.SetStateAction<BuildImageLayer>>] => {
  const [layer, setLayer] = React.useState<BuildImageLayer>({
    width: 100,
    height: 100,
    blend: "add",
    gravity: "north",
    background: undefined,
    type: "watermark",
    ...props,
  } as BuildImageLayer);

  return [layer, setLayer];
};

export const LayerBox: React.FC<{
  layer: BuildImageLayer;
  defaultExpanded?: boolean;
  onLayerChange: (l: BuildImageLayer) => void;
}> = ({ layer, defaultExpanded = false, onLayerChange }) => {
  const handleSetLayer = (u: Partial<BuildImageLayer>): void => {
    onLayerChange({
      ...layer,
      ...u,
      type: u.type ?? layer.type,
    } as BuildImageLayer);
  };

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<Icons.ExpandMore fontSize="small" />}
        sx={{ minHeight: 36, "& .MuiAccordionSummary-content": { my: 0.5 } }}
      >
        <Typography variant="caption" fontWeight={600}>
          {layer.type}
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0, pb: 1 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid size={{ xs: 3 }}>
            <ResettableTextField
              label="w %"
              value={layer.width ?? 100}
              type="number"
              size="small"
              onChange={(e) => handleSetLayer({ width: +e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <ResettableTextField
              label="h %"
              value={layer.height ?? 100}
              type="number"
              size="small"
              onChange={(e) => handleSetLayer({ height: +e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <SearchableInput
              label="Gravity"
              selectedItems={[{ id: layer.gravity, name: layer.gravity }]}
              getValue={(v) =>
                typeof v === "string"
                  ? v
                  : Array.isArray(v)
                    ? v[0].name
                    : v.name
              }
              items={GRAVITY_OPTIONS.map((c) => ({ id: c, name: c }))}
              onSelectItem={(e) => {
                if (e) handleSetLayer({ gravity: e.name });
              }}
              onUnselectItem={() => {}}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <SearchableInput
              label="Blend"
              selectedItems={[{ id: layer.blend, name: layer.blend }]}
              getValue={(v) =>
                typeof v === "string"
                  ? v
                  : Array.isArray(v)
                    ? v[0].name
                    : v.name
              }
              items={BLEND_OPTIONS.map((c) => ({ id: c, name: c }))}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              onSelectItem={(e) => {
                if (e) handleSetLayer({ blend: e.name });
              }}
              onUnselectItem={() => {}}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: layer.type === "text" ? 6 : 12 }}>
            <ColorInput
              label="background"
              source="background"
              value={layer.background}
              size="small"
              onChange={(e) =>
                handleSetLayer({ background: toColor(e.target.value) })
              }
            />
          </Grid>
          {layer.type === "text" ? (
            <Grid size={{ xs: 6 }}>
              <ColorInput
                label="textColor"
                source="color"
                value={layer.color}
                size="small"
                onChange={(e) =>
                  handleSetLayer({ color: toColor(e.target.value) })
                }
              />
            </Grid>
          ) : null}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export const BuildImageButton: React.FC<
  Omit<InputProps, "source"> & {
    text: string;
    media: string;
    onBuild: (base64: string, base64Source: string) => void;
  }
> = ({ text: postText, media, onBuild, ..._props }) => {
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
    gravity: "southeast",
    height: 10,
    width: 10,
    blend: "over",
  });
  const [preview, setPreview] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleClick = (): void => {
    setLoading(true);
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
        const base64 = response.data as string;
        const src = toBase64SourceImg(base64);
        setPreview(src);
        onBuild(base64, src);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box display="flex" flexDirection="column" gap={0.5}>
      <LayerBox
        layer={mediaLayer}
        defaultExpanded
        onLayerChange={setMediaLayer}
      />
      <LayerBox layer={text} defaultExpanded onLayerChange={setText} />
      <LayerBox layer={watermark} onLayerChange={setWatermark} />
      <Button
        variant="contained"
        size="small"
        disabled={loading || !text || !media}
        onClick={handleClick}
        sx={{ alignSelf: "flex-start", mt: 0.5 }}
      >
        {loading ? "Building…" : "Build image"}
      </Button>
      {preview !== null ? (
        <Box
          component="img"
          src={preview}
          alt="built preview"
          sx={{
            mt: 1,
            maxWidth: "100%",
            maxHeight: 300,
            objectFit: "contain",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        />
      ) : null}
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
