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
import { Box } from "../../mui";
import ReferenceArrayLinkInput from "./ReferenceArrayLinkInput";

export const LinkArrayInput: React.FC<
  { source: string } & Omit<ArrayInputProps, "children">
> = ({ source, defaultValue, ...props }) => {
  return (
    <ArrayInput {...props} source={source}>
      <SimpleFormIterator fullWidth>
        <BooleanInput source="fromURL" />
        <FormDataConsumer>
          {({ formData, scopedFormData, getSource, ...rest }) => {
            const getSrc = getSource ?? ((s: string) => s);
            if (scopedFormData?.fromURL) {
              return (
                <Box style={{ width: "100%" }}>
                  <TextInput source={getSrc("url")} fullWidth />
                  <TextInput
                    source={getSrc("description")}
                    multiline
                    fullWidth
                  />
                  <DateInput source={getSrc("publishDate")} />
                </Box>
              );
            }
            return (
              <Box width="100%">
                <ReferenceArrayLinkInput
                  source={getSrc("ids")}
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
