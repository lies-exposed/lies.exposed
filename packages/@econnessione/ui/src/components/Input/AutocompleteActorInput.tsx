import { Actor } from "@econnessione/shared/io/http";
import { available, queryStrict } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { GetListParams } from "react-admin";
import { Queries } from "../../providers/DataProvider";
import { ActorList, ActorListItem } from "../lists/ActorList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteActorInputProps {
  selectedItems: Actor.Actor[];
  onChange: (items: Actor.Actor[]) => void;
}

export const AutocompleteActorInput: React.FC<AutocompleteActorInputProps> = ({
  selectedItems,
  onChange,
}) => {
  return (
    <AutocompleteInput<Actor.Actor>
      placeholder="Actors..."
      getValue={(a) => a.fullName}
      searchToFilter={(fullName) => ({ fullName })}
      selectedItems={selectedItems}
      query={queryStrict(
        (input: GetListParams) =>
          input.filter.fullName !== ""
            ? Queries.Actor.getList.run(input)
            : TE.right({ data: [], total: 0 }),
        available
      )}
      renderTags={(items) => (
        <ActorList
          actors={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onActorClick={(a) => onChange(items.filter((i) => i.id !== a.id))}
        />
      )}
      renderOption={(item, state) => (
        <ActorListItem
          key={item.id}
          displayFullName={true}
          item={{
            ...item,
            selected: false,
          }}
          onClick={() => {}}
        />
      )}
      onItemsChange={onChange}
    />
  );
};
