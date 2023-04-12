import { getTextContentsCapped } from "@liexp/shared/lib/slate";
import * as R from "fp-ts/Record";
import * as React from "react";
import { FunctionField, type FieldProps } from "react-admin";

const ExcerptField: React.FC<FieldProps> = (props) => {
  return (
    <FunctionField
      {...props}
      label="excerpt"
      render={(r: any) => {
        return !R.isEmpty(r.excerpt)
          ? getTextContentsCapped(r.excerpt, 60)
          : "";
      }}
    />
  );
};
export default ExcerptField;
