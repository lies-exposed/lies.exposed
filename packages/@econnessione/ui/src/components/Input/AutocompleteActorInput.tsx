import { Actor } from "@econnessione/shared/io/http";
import * as React from "react";
import { Queries } from "../../providers/DataProvider";
import { ActorList, ActorListItem } from "../lists/ActorList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteActorInputProps {
  selectedIds: string[];
  onChange: (items: Actor.Actor[]) => void;
}

export const AutocompleteActorInput: React.FC<AutocompleteActorInputProps> = ({
  selectedIds,
  onChange,
}) => {
  return (
    <AutocompleteInput<Actor.Actor>
      placeholder="Actors..."
      getValue={(a) => a.fullName}
      searchToFilter={(fullName) => ({ fullName })}
      selectedIds={selectedIds}
      query={Queries.Actor.getList}
      renderTags={(items) => (
        <ActorList
          actors={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onActorClick={(a) => onItemClick(items.filter((i) => i.id !== a.id))}
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
