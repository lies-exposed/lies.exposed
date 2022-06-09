import { Actor, Group, Keyword } from "@liexp/shared/io/http";
import { ActorListItem } from "@liexp/ui/components/lists/ActorList";
import { GroupListItem } from "@liexp/ui/components/lists/GroupList";
import { KeywordListItem } from "@liexp/ui/components/lists/KeywordList";
import {
  Autocomplete,
  AutocompleteInputChangeReason,
  AutocompleteProps,
  Box,
  TextField,
  Typography,
} from "@liexp/ui/components/mui";
import {
  fetchActors,
  fetchGroups,
  fetchKeywords,
} from "@liexp/ui/state/queries/DiscreteQueries";
import * as React from "react";
import { EventsQueryParams } from "@containers/EventsPanel";

export type SearchOption =
  | {
      type: "Actor";
      item: Actor.Actor;
    }
  | {
      type: "Group";
      item: Group.Group;
    }
  | {
      type: "Keyword";
      item: Keyword.Keyword;
    }
  | {
      type: "Search";
      item: string;
    };

interface SearchInputProps
  extends Omit<
    AutocompleteProps<any, true, undefined, true>,
    "renderInput" | "options"
  > {
  query: EventsQueryParams;
  onQueryChange: (items: SearchOption[]) => void;
}

const SearchEventInput: React.FC<SearchInputProps> = ({
  query,
  onQueryChange,
  ...props
}) => {
  const [search, setSearch] = React.useState(query.title ?? "");
  const [searchOptions, setSearchOptions] = React.useState<SearchOption[]>([]);

  const handleSearchChange = React.useCallback(
    (
      e: React.ChangeEvent<{}>,
      value: string,
      reason: AutocompleteInputChangeReason
    ): void => {
      const q = value;

      if (q.startsWith("#")) {
        // fetch keywords
        void fetchKeywords({
          queryKey: [
            "keywords",
            {
              filter: { search: q.replace("#", "") },
              sort: { field: "createdAt", order: "DESC" },
              pagination: {
                perPage: 20,
                page: 1,
              },
            },
          ],
        }).then((res) => {
          setSearchOptions(res.data.map((g) => ({ type: "Keyword", item: g })));
        });
      } else if (q.startsWith("a@")) {
        // fetch actors
        void fetchActors({
          queryKey: [
            "actors",
            {
              filter: { fullName: q.replace("a@", "") },
              sort: { field: "createdAt", order: "DESC" },
              pagination: {
                perPage: 20,
                page: 1,
              },
            },
          ],
        }).then((res) => {
          setSearchOptions(res.data.map((g) => ({ type: "Actor", item: g })));
        });
      } else if (q.startsWith("g@")) {
        // fetch groups
        void fetchGroups({
          queryKey: [
            "groups",
            {
              filter: { name: q.replace("g@", "") },
              sort: { field: "createdAt", order: "DESC" },
              pagination: {
                perPage: 20,
                page: 1,
              },
            },
          ],
        }).then((groups) => {
          setSearchOptions(
            groups.data.map((g) => ({ type: "Group", item: g }))
          );
        });
      } else {
        setSearchOptions([
          {
            type: "Search",
            item: q,
          },
        ]);
      }

      setSearch(q);
    },
    [search]
  );

  return (
    <Autocomplete
      {...props}
      disablePortal
      freeSolo
      multiple
      options={searchOptions}
      inputValue={search}
      onInputChange={handleSearchChange}
      getOptionLabel={(o) => (o.type === "Search" ? o.item : o.item.id)}
      filterOptions={(options) => options}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          InputProps={{
            ...params.InputProps,
            style: { border: "none" },
          }}
        />
      )}
      renderOption={(props, option) => {
        if (option.type === "Search") {
          return (
            <Typography key={option.item} variant="subtitle1">
              {option.item}
            </Typography>
          );
        }
        if (option.type === "Actor") {
          return (
            <Box key={option.item.id} {...props} component="li">
              <ActorListItem
                displayFullName
                avatarSize="small"
                item={{ ...option.item, selected: true }}
              />
            </Box>
          );
        }
        if (option.type === "Group") {
          return (
            <Box key={option.item.id} {...props} component="li">
              <GroupListItem
                avatarSize="small"
                item={{ ...option.item, selected: true }}
              />
            </Box>
          );
        }

        return (
          <Box
            key={option.item.id}
            {...props}
            component="li"
            sx={{
              py: 5,
            }}
          >
            <KeywordListItem
              item={{ ...option.item, selected: true }}
              onClick={(a) => {
                (props.onChange as any)?.(null, a);
              }}
            />
          </Box>
        );
      }}
      renderTags={(value) => undefined}
      onChange={(e, v) => {
        if (Array.isArray(v)) {
          const values: SearchOption[] = v.map((vv) => {
            if (typeof vv === "string") {
              return {
                type: "Search",
                item: vv,
              };
            }
            return vv;
          });
          setSearchOptions([]);
          onQueryChange(values);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          // onQueryChange([{
          //   ...query,
          //   title: title === "" ? undefined : title,
          // });
        }
      }}
    />
  );
};

export default SearchEventInput;
