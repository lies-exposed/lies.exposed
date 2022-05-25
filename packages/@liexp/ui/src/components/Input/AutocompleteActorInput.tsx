import { Actor } from "@liexp/shared/io/http";
import * as React from "react";
import { useActorsDiscreteQuery } from "../../state/queries/DiscreteQueries";
import { ActorList, ActorListItem } from "../lists/ActorList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteActorInputProps {
  className?: string;
  selectedItems: Actor.Actor[];
  onChange: (items: Actor.Actor[]) => void;
}

export const AutocompleteActorInput: React.FC<AutocompleteActorInputProps> = ({
  selectedItems,
  onChange,
  ...props
}) => {
  return (
    <AutocompleteInput<Actor.Actor>
      placeholder="Actors..."
      getValue={(a) => (typeof a === "string" ? a : a.fullName)}
      searchToFilter={(fullName) => ({ fullName })}
      selectedItems={selectedItems}
      query={useActorsDiscreteQuery}
      renderTags={(items) => (
        <ActorList
          actors={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          onActorClick={(a) => onChange(items.filter((i) => i.id !== a.id))}
        />
      )}
      renderOption={(props, item, state) => (
        <ActorListItem
          key={item.id}
          displayFullName={true}
          item={{
            ...item,
            selected: false,
          }}
          onClick={() => {
            onChange(selectedItems.filter((i) => i.id !== item.id).concat(item))
          }}
        />
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
