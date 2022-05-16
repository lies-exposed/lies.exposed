import { MediaType } from "@liexp/shared/io/http/Media";
import { Box } from "@mui/material";
import { FormDataConsumer } from "ra-core";
import * as React from "react";
import {
  ArrayInput,
  ArrayInputProps,
  AutocompleteArrayInput,
  BooleanInput,
  ReferenceArrayInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
} from "react-admin";
import { MediaInput } from "./MediaInput";

export const MediaArrayInput: React.FC<
  { source: string } & Omit<ArrayInputProps, "children">
> = (props) => {
  return (
    <ArrayInput {...props} style={{ width: "100%" }}>
      <SimpleFormIterator>
        <BooleanInput source="addNew" />
        <FormDataConsumer>
          {({ formData, scopedFormData, getSource, ...rest }) => {
            const getSrc = getSource ?? ((s: string) => s);
            if (scopedFormData?.addNew) {
              return (
                <Box style={{ width: "100%" }}>
                  <BooleanInput
                    label="fromURL"
                    source={getSrc("fromURL")}
                    {...({ record: formData } as any)}
                  />
                  <FormDataConsumer>
                    {({
                      formData: newFormData,
                      scopedFormData: newScopedData,
                      getSource: getNewSource,
                      ...newRest
                    }) => {
                      const descriptionSource = getSrc("description");
                      const locationSource = getSrc("location");
                      // console.log({
                      //   newFormData,
                      //   newScopedData,
                      //   getNewSource,
                      //   newRest,
                      //   locationSource,
                      //   descriptionSource,
                      //   typeSource,
                      // });

                      if (scopedFormData?.fromURL) {
                        const typeSource = getSrc("type");
                        return (
                          <Box>
                            <Box>
                              <TextInput
                                {...newRest}
                                label="location"
                                source={locationSource}
                                type={"url"}
                                {...{ record: newFormData }}
                              />
                            </Box>
                            <Box>
                              <TextInput
                                {...newRest}
                                label="description"
                                source={descriptionSource}
                                {...{ record: newFormData }}
                              />
                            </Box>
                            <Box>
                              <SelectInput
                                label="type"
                                source={typeSource}
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
                            {...newRest}
                            source={descriptionSource}
                            {...{record: newFormData}}
                          />
                          <MediaInput
                            {...newRest}
                            sourceLocation={locationSource}
                            sourceType={`src`}
                            {...{record: newFormData}}
                          />
                        </Box>
                      );
                    }}
                  </FormDataConsumer>
                </Box>
              );
            }
            return (
              <Box style={{ width: "100%" }}>
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
