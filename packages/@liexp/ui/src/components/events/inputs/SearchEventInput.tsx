import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useEndpointQueries } from "../../../hooks/useEndpointQueriesProvider.js";
import { type SearchEventsQueryInputNoPagination } from "../../../state/queries/SearchEventsQuery.js";
import { ActorListItem } from "../../lists/ActorList.js";
import { GroupListItem } from "../../lists/GroupList.js";
import { KeywordListItem } from "../../lists/KeywordList.js";
import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  type AutocompleteInputChangeReason,
  type AutocompleteProps,
  type AutocompleteRenderInputParams,
  type InputProps,
} from "../../mui/index.js";

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
  query: SearchEventsQueryInputNoPagination;
  onQueryChange: (items: SearchFilter) => void;
  inputParams?: Partial<Omit<AutocompleteRenderInputParams, "InputProps">> & {
    InputProps: Partial<InputProps>;
  };
}

export interface SearchFilter {
  q: string | undefined;
  groups: Group.Group[];
  actors: Actor.Actor[];
  keywords: Keyword.Keyword[];
}

const serializeOption = (options: SearchOption[]): SearchFilter => {
  return options.reduce<SearchFilter>(
    (acc, o) => {
      return {
        q: acc.q ?? (o.type === "Search" ? o.item : undefined),
        groups: acc.groups.concat(o.type === "Group" ? [o.item] : []),
        actors: acc.actors.concat(o.type === "Actor" ? [o.item] : []),
        keywords: acc.keywords.concat(o.type === "Keyword" ? [o.item] : []),
      };
    },
    {
      q: undefined,
      groups: [],
      actors: [],
      keywords: [],
    },
  );
};

const SearchEventInput: React.FC<SearchInputProps> = ({
  query,
  onQueryChange,
  inputParams,
  ...props
}) => {
  const { Queries } = useEndpointQueries();
  const [search, setSearch] = React.useState(query.q ?? "");
  const [searchOptions, setSearchOptions] = React.useState<SearchOption[]>([]);

  const handleSearchChange = React.useCallback(
    (
      e: React.ChangeEvent<any>,
      value: string,
      reason: AutocompleteInputChangeReason,
    ): void => {
      const q = value;

      if (q.startsWith("#")) {
        // fetch keywords
        void Queries.Keyword.list
          .fetch({
            filter: { q: q.replace("#", "") },
            sort: { field: "createdAt", order: "DESC" },
            pagination: {
              perPage: 20,
              page: 1,
            },
          })
          .then((res) => {
            setSearchOptions(
              res.data.map((g) => ({ type: "Keyword", item: g })),
            );
          });
      } else if (q.startsWith("a@")) {
        // fetch actors
        void Queries.Actor.list
          .fetch({
            filter: { q: q.replace("a@", "") },
            sort: { field: "createdAt", order: "DESC" },
            pagination: {
              perPage: 20,
              page: 1,
            },
          })
          .then((res) => {
            setSearchOptions(res.data.map((g) => ({ type: "Actor", item: g })));
          });
      } else if (q.startsWith("g@")) {
        // fetch groups
        void Queries.Group.list
          .fetch({
            filter: { q: q.replace("g@", "") },
            sort: { field: "createdAt", order: "DESC" },
            pagination: {
              perPage: 20,
              page: 1,
            },
          })
          .then((groups) => {
            setSearchOptions(
              groups.data.map((g) => ({ type: "Group", item: g })),
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
    [search],
  );

  const loading = search === "" || search.length < 3;

  return (
    <Autocomplete
      {...props}
      disablePortal
      freeSolo
      multiple
      // value={searchOptions}
      options={searchOptions}
      inputValue={search}
      onInputChange={handleSearchChange}
      getOptionLabel={(o) => (o.type === "Search" ? o.item : o.item.id)}
      filterOptions={(options) => options}
      renderInput={(params) => (
        <TextField
          {...params}
          {...inputParams}
          variant="standard"
          InputProps={{
            ...params.InputProps,
            style: { border: "none" },
            ...inputParams?.InputProps,
          }}
        />
      )}
      renderOption={(props, option, state, ownerState) => {
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
              // onClick={(a) => {
              //   (props.onChange as any)?.(null, {...a, selected: false });
              // }}
            />
          </Box>
        );
      }}
      renderTags={(value) => undefined}
      onChange={(e, v, reason, details) => {
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
          // console.log('values', reason,  values, details);
          setSearchOptions([]);
          onQueryChange(serializeOption(values));
        } else {
          setSearchOptions([v]);
        }
      }}
      loading={loading}
      loadingText={
        <div>
          <Typography variant="subtitle1">Start typing:</Typography>
          <Box>
            <Typography display="block">
              <b>#</b> for keywords
            </Typography>

            <Typography display="block">
              <b>a@</b> for actors
            </Typography>
            <Typography display="block">
              <b>g@</b> for groups
            </Typography>
          </Box>
        </div>
      }
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
