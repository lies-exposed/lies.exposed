import {
  ByActorId,
  ByGroupId,
} from "@liexp/shared/lib/io/http/Common/index.js";
import get from "lodash/get";
import * as React from "react";
import {
  FormDataConsumer,
  SelectInput,
  TextInput,
  type ReferenceInputProps,
} from "react-admin";
import { Stack } from "../../../../mui/index.js";
import ReferenceActorInput from "../../../actors/ReferenceActorInput.js";
import ReferenceGroupInput from "../../../groups/ReferenceGroupInput.js";

const ReferenceBySubjectInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source?: string }
> = ({ source, ...props }) => {
  const typeSource = source ? `${source}.type` : `type`;
  const idSource = source ? `${source}.id` : `id`;

  return (
    <Stack direction={"row"} spacing={2} alignItems={"center"}>
      <SelectInput
        {...props}
        size="small"
        source={typeSource}
        choices={[ByActorId, ByGroupId]
          .map((t) => t.fields.type.literals[0])
          .map((v) => ({
            id: v,
            name: v,
          }))}
      />

      <FormDataConsumer>
        {({ formData, scopedFormData, ...rest }) => {
          const type = get(source ? formData : scopedFormData, typeSource);

          if (type === "Actor") {
            return (
              <ReferenceActorInput {...props} {...rest} source={idSource} />
            );
          } else if (type === "Group") {
            return (
              <ReferenceGroupInput {...props} {...rest} source={idSource} />
            );
          }
          return (
            <TextInput
              defaultValue={"Select subject type"}
              size="small"
              source={idSource}
              disabled
            />
          );
        }}
      </FormDataConsumer>
    </Stack>
  );
};

export default ReferenceBySubjectInput;
