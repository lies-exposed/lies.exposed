import { Box } from "@material-ui/core";
import { FormDataConsumer } from "ra-core";
import {
  ArrayInput,
  ArrayInputProps,
  AutocompleteArrayInput,
  BooleanInput,
  ReferenceArrayInput,
  SimpleFormIterator,
  TextInput,
} from "ra-ui-materialui";
import * as React from "react";
import { MediaInput } from "./MediaInput";

export const MediaArrayInput: React.FC<
  { source: string } & Omit<ArrayInputProps, "children">
> = (props) => {
  return (
    <ArrayInput {...props}>
      <SimpleFormIterator>
        <BooleanInput source="addNew" />
        <FormDataConsumer>
          {({ formData, scopedFormData, getSource, ...rest }) => {
            const getSrc = getSource ?? ((s: string) => s);

            if (scopedFormData?.addNew) {
              return (
                <Box>
                  <BooleanInput source="fromURL" />
                  <FormDataConsumer>
                    {({
                      formData: newFormData,
                      scopedFormData: newScopedData,
                      getSource: getNewSource,
                      ...newRest
                    }) => {
                      if (newScopedData.fromURL) {
                        return (
                          <TextInput
                            source={getNewSource?.("location") ?? "location"}
                            type="url"
                            {...newRest}
                          />
                        );
                      }
                      return (
                        <Box>
                          <TextInput source={getSrc("description")} {...rest} />
                          <MediaInput
                            sourceLocation={getSrc("location")}
                            sourceType={getSrc("type") as any}
                          />
                        </Box>
                      );
                    }}
                  </FormDataConsumer>
                </Box>
              );
            }
            return (
              <Box>
                <ReferenceArrayInput
                  source={getSrc("ids")}
                  reference="media"
                  {...rest}
                >
                  <AutocompleteArrayInput
                    source="id"
                    optionText="description"
                  />
                </ReferenceArrayInput>
              </Box>
            );
          }}
        </FormDataConsumer>
      </SimpleFormIterator>
    </ArrayInput>
  );
};
