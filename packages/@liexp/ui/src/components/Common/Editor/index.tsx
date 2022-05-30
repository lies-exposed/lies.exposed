import RPEditor, {
  EditorProps,
  Value,
  getTextContents,
  createValue,
} from "@react-page/editor";
import background from "@react-page/plugins-background";
import divider from "@react-page/plugins-divider";
import html5Video from "@react-page/plugins-html5-video";
import image from "@react-page/plugins-image";
import spacer from "@react-page/plugins-spacer";
import video from "@react-page/plugins-video";
import * as React from "react";
import customSlate from "./plugins/customSlate";
import gridCellPlugin from "./plugins/gridCellPlugin";

export const minimalCellPlugins = [customSlate] as any[];

export const getTextContentsCapped = (
  v: Value | undefined,
  end: number
): string => {
  if (v) {
    const contents = getTextContents(v, {
      lang: "en",
      cellPlugins: minimalCellPlugins,
    })
      .join("\n")
      .substring(0, end);

    return contents;
  }
  return "";
};

// Define which plugins we want to use.
export const cellPlugins = [
  customSlate,
  background({}),
  image,
  spacer,
  divider,
  video,
  html5Video,
  gridCellPlugin,
] as any[];

export const isValidValue = (v?: any): v is Value => {
  const valid =
    !!v &&
    !!v.version &&
    Array.isArray(v.rows) &&
    v?.rows?.length > 0;

  return valid;
};

export const createExcerptValue = (text: string): Value => {
  return createValue(
    {
      rows: [
        [
          {
            id: customSlate.id,
            plugin: customSlate.id,
            data: customSlate.createData((def) => ({
              children: [
                {
                  plugin: def.plugins.paragraphs.paragraph,
                  children: [text],
                },
              ],
            })),
          },
        ],
      ],
    },
    {
      lang: "en",
      cellPlugins: minimalCellPlugins,
    }
  );
};

const Editor: React.FC<Omit<EditorProps, "cellPlugins">> = ({
  value: initialValue,
  ...props
}) => {
  const [value, setValue] = React.useState<Value | null>(initialValue as any);

  return (
    <RPEditor
      cellPlugins={cellPlugins}
      value={value}
      onChange={setValue}
      {...props}
    />
  );
};

export default Editor;
