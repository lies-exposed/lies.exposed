import { type Actor } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useQuery } from "react-query";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider";
import { ActorList, ActorListItem } from "../lists/ActorList";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteActorInputProps {
  className?: string;
  selectedItems: Actor.Actor[];
  options?: Actor.Actor[];
  onChange: (items: Actor.Actor[]) => void;
  discrete?: boolean;
}

export const AutocompleteActorInput: React.FC<AutocompleteActorInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  options,
  ...props
}) => {
  const Queries = useEndpointQueries();
  return (
    <AutocompleteInput<Actor.Actor>
      disablePortal={true}
      placeholder="Actors..."
      getOptionLabel={(a) => (typeof a === "string" ? a : a.fullName)}
      searchToFilter={(fullName) => ({ fullName })}
      selectedItems={selectedItems}
      query={(p) =>
        options
          ? useQuery(["actor-options"], () =>
              Promise.resolve({ data: options }),
            )
          : Queries.Actor.list.useQuery(p, undefined, discrete)
      }
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
          style={{ display: "flex" }}
          item={{
            ...item,
            selected: true,
          }}
          onClick={() => {
            onChange(
              selectedItems.filter((i) => i.id !== item.id).concat(item),
            );
          }}
        />
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
