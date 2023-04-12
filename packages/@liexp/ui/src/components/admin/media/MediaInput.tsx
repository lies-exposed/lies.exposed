import { MediaType } from "@liexp/shared/lib/io/http/Media";
import * as React from "react";
import {
  FileInput,
  FormDataConsumer,
  type InputProps,
  SelectInput,
  TextInput,
} from "react-admin";
import { Box } from "../../mui";
import { MediaField } from "./MediaField";

interface MediaInputProps extends Omit<InputProps, "source"> {
  sourceType: string;
  sourceLocation: string;
  supportedTypes?: MediaType[];
}

export const MediaInput: React.FC<MediaInputProps> = ({
  sourceType,
  sourceLocation,
  supportedTypes,
  ...props
}) => {
  const types = supportedTypes ?? MediaType.types.map((a) => a.value);

  return (
    <Box>
      <SelectInput
        source="_type"
        defaultValue={"fromURL"}
        choices={[
          { name: "fromURL", id: "fromURL" },
          {
            name: "fromFile",
            id: "fromFile",
          },
        ]}
      />
      <FormDataConsumer>
        {({ formData, scopedFormData, getSource, ...rest }) => {
          const mediaType = formData[sourceLocation]?.rawFile?.type;

          if (formData._type === "fromFile") {
            const mediaSrc = formData[sourceLocation]?.src;

            return (
              <Box>
                <FileInput
                  {...props}
                  source={sourceLocation}
                  accept={types.map((a) => `.${a.split("/")[1]}`).join(",")}
                >
                  <MediaField
                    source={sourceLocation}
                    type={sourceType}
                    record={{
                      ...formData,
                      [sourceLocation]: mediaSrc,
                    }}
                  />
                </FileInput>
              </Box>
            );
          }

          return (
            <Box>
              <TextInput source={sourceLocation} />
              <SelectInput
                {...rest}
                fullWidth
                source={sourceType}
                choices={MediaType.types.map((v) => ({
                  id: v.value,
                  name: v.value,
                }))}
                defaultValue={mediaType}
              />
            </Box>
          );
        }}
      </FormDataConsumer>
    </Box>
  );
};
