import { type Actor } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useActorsQuery } from "../../state/queries/actor.queries";
import { ActorList, ActorListItem } from "../lists/ActorList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteActorInputProps {
  className?: string;
  selectedItems: Actor.Actor[];
  onChange: (items: Actor.Actor[]) => void;
  discrete?: boolean;
}

export const AutocompleteActorInput: React.FC<AutocompleteActorInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  ...props
}) => {
  return (
    <AutocompleteInput<Actor.Actor>
      placeholder="Actors..."
      getValue={(a) => (typeof a === "string" ? a : a.fullName)}
      searchToFilter={(fullName) => ({ fullName })}
      selectedItems={selectedItems}
      query={(p) => useActorsQuery(p, discrete)}
      renderTags={(items) => (
        <ActorList
          actors={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onActorClick={(a) => {
            onChange(items.filter((i) => i.id !== a.id));
          }}
        />
      )}
      renderOption={(props, item, state) => (
        <ActorListItem
          key={item.id}
          displayFullName={true}
          item={{
            ...item,
            selected: true,
          }}
          onClick={() => {
            onChange(
              selectedItems.filter((i) => i.id !== item.id).concat(item)
            );
          }}
        />
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
