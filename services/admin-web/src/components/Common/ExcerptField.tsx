import { getTextContentsCapped } from "@liexp/ui/components/Common/Editor";
import * as R from "fp-ts/lib/Record";
import { FunctionField, FieldProps } from "ra-ui-materialui";
import * as React from "react";

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
