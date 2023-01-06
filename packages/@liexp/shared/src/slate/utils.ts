import {
  createValue,
  getTextContents as defaultGetTextContents,
  Value
} from "@react-page/editor";
import { getLiexpSlate } from "./plugins/customSlate";

export const getTextContents = (v: Value): string[] => {
  return defaultGetTextContents(v, {
    lang: "en",
    cellPlugins: [getLiexpSlate({})],
  });
};

export const getTextContentsCapped = (
  v: Value | undefined,
  end: number
): string => {
  if (v) {
    const contents = getTextContents(v).join("\n").substring(0, end);

    return contents;
  }
  return "";
};

export const isValidValue = (v?: any): v is Value => {
  const valid =
    !!v && !!v.version && Array.isArray(v.rows) && v?.rows?.length > 0;

  return valid;
};

export const createExcerptValue = (text: string): Value => {
  const slate = getLiexpSlate({});
  return createValue(
    {
      rows: [
        [
          {
            id: slate.id,
            plugin: slate.id,
            data: slate.createData((def) => ({
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
      cellPlugins: [slate],
    }
  );
};
