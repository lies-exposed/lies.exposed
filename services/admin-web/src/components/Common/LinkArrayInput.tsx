import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import {
  ArrayInput,
  ArrayInputProps,
  BooleanInput,
  DateInput,
  SimpleFormIterator,
  TextInput,
  FormDataConsumer,
} from "react-admin";
import ReferenceArrayLinkInput from "./ReferenceArrayLinkInput";

export const LinkArrayInput: React.FC<
  { source: string } & Omit<ArrayInputProps, "children">
> = (props) => {
  return (
    <ArrayInput source={props.source}>
      <SimpleFormIterator>
        <BooleanInput source="fromURL" />
        <FormDataConsumer>
          {({ formData, scopedFormData, getSource, ...rest }) => {
            const getSrc = getSource ?? ((s: string) => s);
            if (scopedFormData?.fromURL) {
              return (
                <Box>
                  <TextInput source={getSrc("url")} fullWidth />
                  <TextInput source={getSrc("description")} multiline fullWidth />
                  <DateInput source={getSrc("publishDate")} />
                </Box>
              );
            }
            return (
              <Box>
                <ReferenceArrayLinkInput source={getSrc("ids")} />
              </Box>
            );
          }}
        </FormDataConsumer>
      </SimpleFormIterator>
    </ArrayInput>
  );
};
