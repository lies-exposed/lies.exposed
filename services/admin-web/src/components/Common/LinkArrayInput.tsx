import { Box } from "@material-ui/core";
import { FormDataConsumer } from "ra-core";
import {
  ArrayInput,
  ArrayInputProps,
  BooleanInput,
  DateInput,
  SimpleFormIterator,
  TextInput,
} from "ra-ui-materialui";
import * as React from "react";
import ReferenceArrayLinkInput from "./ReferenceArrayLinkInput";

export const LinkArrayInput: React.FC<
  { source: string } & Omit<ArrayInputProps, "children">
> = (props) => {
  return (
    <ArrayInput {...props}>
      <SimpleFormIterator>
        <BooleanInput source="fromURL" />
        <FormDataConsumer>
          {({ formData, scopedFormData, getSource, ...rest }) => {
            const getSrc = getSource ?? ((s: string) => s);
            if (scopedFormData?.fromURL) {
              return (
                <Box>
                  <TextInput source={getSrc("url")} {...formData} {...rest} />
                  <DateInput
                    source={getSrc("publishDate")}
                    {...formData}
                    {...rest}
                  />
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
