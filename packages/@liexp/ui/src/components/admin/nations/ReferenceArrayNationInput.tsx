import * as React from "react";
import { FlagIcon } from "../../Common/Icons/FlagIcon.js";
import {
  type ReferenceArrayInputProps,
  ReferenceArrayInput,
  AutocompleteArrayInput,
} from "../react-admin.js";

export const ReferenceArrayNationInput: React.FC<
  Omit<ReferenceArrayInputProps, "children" | "reference"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} label="Nations" reference="nations">
      <AutocompleteArrayInput
        source="id"
        optionText={(t) => (
          <div>
            <FlagIcon isoCode={t.isoCode} /> {t.name}
          </div>
        )}
        getOptionLabel={(option) => option.name ?? option.id}
        translateChoice={false}
        fullWidth
        filterToQuery={(q) => ({ q })}
        size="small"
      />
    </ReferenceArrayInput>
  );
};
