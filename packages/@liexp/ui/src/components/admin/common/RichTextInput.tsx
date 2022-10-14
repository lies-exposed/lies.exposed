import {
  RichTextInput as RaRichTextInput,
  RichTextInputProps as RaRichTextInputProps,
} from "ra-input-rich-text";
import * as React from "react";
import { useRecordContext } from "react-admin";

const RichTextInput: React.FC<
  Omit<RaRichTextInputProps, "toolbar"> & { source: string }
> = (props) => {
  const record = useRecordContext();
  return (
    <RaRichTextInput
      {...({ record } as any)}
      toolbar={[["bold", "italic", "underline", "link"]]}
    />
  );
};

export default RichTextInput;
