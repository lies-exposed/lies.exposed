import React from "react";
import {
  ArrayInput,
  SimpleFormIterator,
  type ReferenceInputProps,
} from "react-admin";
import ReferenceBySubjectInput from "./ReferenceBySubjectInput";

const ReferenceArrayBySubjectInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string }
> = ({ source, ...props }) => {
  return (
    <ArrayInput {...props} source={source}>
      <SimpleFormIterator fullWidth>
        <ReferenceBySubjectInput {...props} source="" />
      </SimpleFormIterator>
    </ArrayInput>
  );
};

export default ReferenceArrayBySubjectInput;
