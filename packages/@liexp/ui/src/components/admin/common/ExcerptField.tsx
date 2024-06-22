import * as R from "fp-ts/Record";
import * as React from "react";
import { FunctionField, type FieldProps } from "react-admin";
import { getTextContentsCapped } from "../../Common/BlockNote/utils/index.js";

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
