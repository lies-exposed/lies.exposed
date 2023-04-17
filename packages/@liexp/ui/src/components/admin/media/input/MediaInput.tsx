import { MediaType } from "@liexp/shared/lib/io/http/Media";
import { get } from "lodash";
import * as React from "react";
import {
  FileInput,
  FormDataConsumer,
  SelectInput,
  TextInput,
  type InputProps,
} from "react-admin";
import { Box } from "../../../mui";
import { MediaField } from "../MediaField";

interface MediaInputProps extends Omit<InputProps, "source"> {
  sourceType: string;
  sourceLocation: string;
  type?: "fromURL" | "fromFile";
  supportedTypes?: MediaType[];
  source?: string;
  style?: React.CSSProperties;
}

export const MediaInput: React.FC<MediaInputProps> = ({
  sourceType,
  sourceLocation,
  type: _type = 'fromFile',
  supportedTypes,
  source,
  style,
  ...props
}) => {

  const types = supportedTypes ?? MediaType.types.map((a) => a.value);

  // console.log({ type, sourceType, sourceLocation });
  return (
    <Box style={style}>
      <SelectInput
        source={_type}
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

          if (get(formData, getSource?.(_type) ?? _type) === "fromFile") {
            const mediaSrc = get(formData, sourceLocation)?.src;

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
