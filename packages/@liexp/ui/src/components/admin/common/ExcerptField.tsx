import * as R from "fp-ts/lib/Record.js";
import * as React from "react";
import { FunctionField, type FieldProps } from "react-admin";
import { editor } from "../../Common/Editor/index.js";

const ExcerptField: React.FC<FieldProps> = (props) => {
  return (
    <FunctionField
      {...props}
      label="excerpt"
      render={(r: any) => {
        return !R.isEmpty(r.excerpt)
          ? editor.getTextContentsCapped(r.excerpt, 60)
          : "";
      }}
    />
  );
};
export default ExcerptField;
