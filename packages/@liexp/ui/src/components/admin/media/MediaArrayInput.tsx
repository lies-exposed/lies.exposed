import * as React from "react";
import {
  ArrayInput,
  ArrayInputProps,
  BooleanInput,
  FormDataConsumer,
  SimpleFormIterator,
  TextInput,
} from "react-admin";
import { Box } from "../../mui";
import { MediaInput } from "./MediaInput";
import ReferenceMediaInput from "./ReferenceMediaInput";

export const MediaArrayInput: React.FC<
  { source: string } & Omit<ArrayInputProps, "children">
> = (props) => {
  return (
    <ArrayInput {...props} style={{ width: "100%" }} fullWidth>
      <SimpleFormIterator fullWidth>
        <BooleanInput source="addNew" />
        <FormDataConsumer>
          {({
            formData: record,
            scopedFormData,
            getSource,
            ...rest
          }) => {

            const getSrc = getSource ?? ((s: string) => s);

            const descriptionSource = getSrc("description");
            const locationSource = getSrc("location");
            const typeSource = getSrc("type");

            if (scopedFormData?.addNew) {
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
            }

            return (
              <Box width={"100%"}>
                <ReferenceMediaInput source={locationSource} fullWidth />
              </Box>
            );
          }}
        </FormDataConsumer>
      </SimpleFormIterator>
    </ArrayInput>
  );
};
