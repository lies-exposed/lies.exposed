import RaInputRichText from "ra-input-rich-text";
import type { RaInputRichTextProps } from "ra-input-rich-text";
import * as React from "react";
import { useRecordContext } from "react-admin";

const RichTextInput: React.FC<
  Omit<RaInputRichTextProps, "toolbar"> & { source: string }
> = (props) => {
  const record = useRecordContext();
  return (
    <RaInputRichText
      {...({ record } as any)}
      toolbar={[["bold", "italic", "underline", "link"]]}
    />
  );
};

export default RichTextInput;
