import { FlagIcon } from "@liexp/ui/lib/components/Common/Icons/FlagIcon.js";
import {
  type ReferenceArrayInputProps,
  ReferenceArrayInput,
  AutocompleteArrayInput,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

export const ReferenceArrayNationInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
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
