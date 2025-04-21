import { type Actor } from "@liexp/shared/lib/io/http/index.js";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { ActorList, ActorListItem } from "../lists/ActorList.js";
import { AutocompleteInput } from "./AutocompleteInput.js";

interface AutocompleteActorInputProps {
  className?: string;
  selectedItems: Actor.Actor[];
  options?: Actor.Actor[];
  onChange: (items: Actor.Actor[]) => void;
  discrete?: boolean;
  tabIndex?: number;
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
      searchToFilter={(q) => ({ q })}
      selectedItems={selectedItems}
      query={(p) =>
        options
          ? useQuery({
              // eslint-disable-next-line @tanstack/query/exhaustive-deps
              queryKey: ["actor-options"],
              queryFn: () =>
                Promise.resolve({ data: options, total: options.length }),
            })
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
