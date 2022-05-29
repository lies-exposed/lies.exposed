import { Box } from "@mui/material";
import { FormDataConsumer, useRecordContext } from "ra-core";
import * as React from "react";
import {
  ArrayInput,
  ArrayInputProps,
  BooleanInput,
  DateInput,
  SimpleFormIterator,
  TextInput,
} from "react-admin";
import ReferenceArrayLinkInput from "./ReferenceArrayLinkInput";

export const LinkArrayInput: React.FC<
  { source: string } & Omit<ArrayInputProps, "children">
> = (props) => {
  const record = useRecordContext();
  return (
    <ArrayInput source={props.source} record={record}>
      <SimpleFormIterator>
        <BooleanInput source="fromURL" />
        <FormDataConsumer>
          {({ formData, scopedFormData, getSource, ...rest }) => {
            const getSrc = getSource ?? ((s: string) => s);
            if (scopedFormData?.fromURL) {
              return (
                <Box>
                  <TextInput source={getSrc("url")} />
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
