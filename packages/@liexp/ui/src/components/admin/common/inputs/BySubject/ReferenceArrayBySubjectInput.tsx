import * as React from "react";
import {
  ArrayInput,
  SimpleFormIterator,
  type ReferenceInputProps,
} from "react-admin";
import ReferenceBySubjectInput from "./ReferenceBySubjectInput.js";

const ReferenceArrayBySubjectInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = ({ source, ...props }) => {
  return (
    <ArrayInput {...props} source={source}>
      <SimpleFormIterator fullWidth>
        <ReferenceBySubjectInput {...props} />
      </SimpleFormIterator>
    </ArrayInput>
  );
};

export default ReferenceArrayBySubjectInput;
