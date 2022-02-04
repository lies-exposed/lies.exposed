import { MediaType } from "@econnessione/shared/io/http/Media";
import { Box } from "@material-ui/core";
import { FormDataConsumer } from "ra-core";
import {
  ArrayInput,
  ArrayInputProps,
  AutocompleteArrayInput,
  BooleanInput,
  ReferenceArrayInput,
  SelectInput,
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
                  <BooleanInput
                    label="fromURL"
                    source={getSrc("fromURL")}
                    record={formData}
                  />
                  <FormDataConsumer>
                    {({
                      formData: newFormData,
                      scopedFormData: newScopedData,
                      getSource: getNewSource,
                      ...newRest
                    }) => {
                      // console.log({
                      //   newFormData,
                      //   newScopedData,
                      //   getNewSource,
                      //   newRest,
                      // });
                      if (scopedFormData?.fromURL) {
                        return (
                          <Box>
                            <Box>
                              <TextInput
                                label="location"
                                source={getSrc("location")}
                                type={"url"}
                                record={newFormData}
                              />
                            </Box>
                            <Box>
                              <TextInput
                                label="description"
                                source={getSrc("description")}
                                record={newFormData}
                              />
                            </Box>
                            <Box>
                              <SelectInput
                                label="type"
                                source={getSrc("type")}
                                choices={MediaType.types.map((v) => ({
                                  id: v.value,
                                  name: v.value,
                                }))}
                              />
                            </Box>
                          </Box>
                        );
                      }
                      return (
                        <Box>
                          <TextInput
                            source={getSrc("description")}
                            record={newFormData}
                            {...newRest}
                          />
                          <MediaInput
                            sourceLocation={getSrc("location")}
                            sourceType={getSrc("type")}
                            record={newFormData}
                            {...newRest}
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
                  sortBy="updatedAt"
                  sortByOrder="DESC"
                  filterToQuery={(description) => ({ description })}
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
