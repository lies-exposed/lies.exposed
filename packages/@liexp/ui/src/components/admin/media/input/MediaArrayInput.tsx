import * as React from "react";
import {
  ArrayInput,
  FormDataConsumer,
  SimpleFormIterator,
  TextInput,
  type ArrayInputProps,
} from "react-admin";
import { Box } from "../../../mui/index.js";
import { MediaInput } from "./MediaInput.js";

export const MediaArrayInput: React.FC<
  { source: string } & Omit<ArrayInputProps, "children">
> = (props) => {
  return (
    <ArrayInput {...props} style={{ width: "100%" }} fullWidth>
      <SimpleFormIterator fullWidth>
        <FormDataConsumer>
          {({ formData: record, scopedFormData, getSource, ...rest }) => {
            const getSrc = getSource ?? ((s: string) => s);

            const descriptionSource = getSrc("description");
            const locationSource = getSrc("location");
            const typeSource = getSrc("type");

            return (
              <Box>
                <MediaInput
                  {...rest}
                  sourceLocation={locationSource}
                  sourceType={typeSource}
                  {...{ record }}
                />
                <TextInput source={descriptionSource} />
              </Box>
            );
          }}
        </FormDataConsumer>
      </SimpleFormIterator>
    </ArrayInput>
  );
};
