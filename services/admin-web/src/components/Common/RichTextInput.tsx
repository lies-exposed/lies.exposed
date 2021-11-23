import RaInputRichText from "ra-input-rich-text";
import type { RaInputRichTextProps } from "ra-input-rich-text";
import * as React from "react";

const RichTextInput: React.FC<Omit<RaInputRichTextProps, "toolbar">> = (
  props
) => {
  return (
    <RaInputRichText
      {...props}
      toolbar={[["bold", "italic", "underline", "link"]]}
    />
  );
};

export default RichTextInput;
