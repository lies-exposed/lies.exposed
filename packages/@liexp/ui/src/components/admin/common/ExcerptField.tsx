import * as R from "fp-ts/lib/Record.js";
import * as React from "react";
import { FunctionField, type FieldProps } from "react-admin";
import { getTextContentsCapped } from "../../Common/BlockNote/utils/index.js";

type ExcerptFieldProps = Omit<FieldProps, 'source'> & {
  source?: string;
};

const ExcerptField: React.FC<ExcerptFieldProps> = (props) => {
  return (
    <FunctionField
      {...props}
      label="excerpt"
      render={(r) => {
        return !R.isEmpty(r.excerpt)
          ? getTextContentsCapped(r.excerpt, 60)
          : "";
      }}
    />
  );
};
export default ExcerptField;
