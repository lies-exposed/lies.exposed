import { Media, MediaType } from "@econnessione/shared/io/http/Media";
import { Box } from "@material-ui/core";
import { FormDataConsumer, InputProps } from "ra-core";
import { FileInput, SelectInput } from "ra-ui-materialui";
import * as React from "react";
import { MediaField } from "./MediaField";

interface MediaInputProps extends Omit<InputProps, "source"> {
  sourceType: string;
  sourceLocation: string;
}

export const MediaInput: React.FC<MediaInputProps> = ({
  sourceType,
  sourceLocation,
  ...props
}) => {
  console.log(props);
  return (
    <Box>
      <FileInput
        source={sourceLocation}
        accept={MediaType.types
          .map((a) => `.${a.value.split("/")[1]}`)
          .join(",")}
      >
        <MediaField source={sourceType} />
      </FileInput>
      <FormDataConsumer>
        {({ formData, scopedFormData, getSource, ...rest }) => {
          const mediaType = formData[sourceLocation]?.rawFile?.type;

          if (!mediaType) {
            return null;
          }

          return (
            <Box>
              <SelectInput
                {...rest}
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
