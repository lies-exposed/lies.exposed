import * as React from "react";
import {
  ArrayInput,
  type ArrayInputProps,
  BooleanInput,
  DateInput,
  SimpleFormIterator,
  TextInput,
  FormDataConsumer,
} from "react-admin";
import { Box } from "../../mui/index.js";
import ReferenceArrayLinkInput from "./ReferenceArrayLinkInput.js";

export const LinkArrayInput: React.FC<
  { source: string } & Omit<ArrayInputProps, "children">
> = ({ source, defaultValue, ...props }) => {
  return (
    <ArrayInput {...props} source={source}>
      <SimpleFormIterator fullWidth>
        <BooleanInput source="fromURL" />
        <FormDataConsumer>
          {({ formData, scopedFormData, ...rest }) => {
            if (scopedFormData?.fromURL) {
              return (
                <Box style={{ width: "100%" }}>
                  <TextInput source={"url"} fullWidth />
                  <TextInput source={"description"} multiline fullWidth />
                  <DateInput source={"publishDate"} />
                </Box>
              );
            }
            return (
              <Box width="100%">
                <ReferenceArrayLinkInput
                  source={"ids"}
                  defaultValue={defaultValue}
                />
              </Box>
            );
          }}
        </FormDataConsumer>
      </SimpleFormIterator>
    </ArrayInput>
  );
};
