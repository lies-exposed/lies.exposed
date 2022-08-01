import { createValue, Value, getTextContents } from "@react-page/editor";
import customSlate from "./plugins/customSlate";

const minimalCellPlugins = [customSlate] as any[];

const getTextContentsCapped = (
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

const isValidValue = (v?: any): v is Value => {
  const valid =
    !!v && !!v.version && Array.isArray(v.rows) && v?.rows?.length > 0;

  return valid;
};

const createExcerptValue = (text: string): Value => {
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

export {
  customSlate,
  minimalCellPlugins,
  getTextContents,
  getTextContentsCapped,
  isValidValue,
  createExcerptValue,
};
