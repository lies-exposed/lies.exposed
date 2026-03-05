import {
  type Actor,
  type Area,
  type Events,
  type Group,
  type Keyword,
  type Link,
  type Media,
  type Story,
} from "@liexp/io/lib/http/index.js";
import * as React from "react";
import { useEndpointQueries } from "../../../hooks/useEndpointQueriesProvider.js";
import { ActorListItem } from "../../lists/ActorList.js";
import { GroupListItem } from "../../lists/GroupList.js";
import { KeywordListItem } from "../../lists/KeywordList.js";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Icons,
  MenuItem,
  MenuList,
  ListItemText,
  TextField,
  Typography,
} from "../../mui/index.js";
import {
  ActorIcon,
  AreaIcon,
  GroupIcon,
  HashtagIcon,
  LinkIcon,
  MediaIcon,
} from "../Icons/FAIcon.js";

// ---------------------------------------------------------------------------
// Resource type definitions
// ---------------------------------------------------------------------------

export type SearchResourceType =
  | "actor"
  | "group"
  | "keyword"
  | "area"
  | "event"
  | "link"
  | "media"
  | "story";

interface ResourceTypeOption {
  value: SearchResourceType;
  label: string;
  icon: React.ReactNode;
}

const RESOURCE_TYPES: ResourceTypeOption[] = [
  { value: "actor", label: "Actors", icon: <ActorIcon /> },
  { value: "group", label: "Groups", icon: <GroupIcon /> },
  { value: "keyword", label: "Keywords", icon: <HashtagIcon /> },
  { value: "area", label: "Areas", icon: <AreaIcon /> },
  {
    value: "event",
    label: "Events",
    icon: <Icons.Assignment fontSize="small" />,
  },
  { value: "link", label: "Links", icon: <LinkIcon /> },
  { value: "media", label: "Media", icon: <MediaIcon /> },
  {
    value: "story",
    label: "Stories",
    icon: <Icons.StoryIcon fontSize="small" />,
  },
];

// ---------------------------------------------------------------------------
// Result union type
// ---------------------------------------------------------------------------

type SearchResult =
  | { kind: "actor"; item: Actor.Actor }
  | { kind: "group"; item: Group.Group }
  | { kind: "keyword"; item: Keyword.Keyword }
  | { kind: "area"; item: Area.Area }
  | { kind: "event"; item: Events.Event }
  | { kind: "link"; item: Link.Link }
  | { kind: "media"; item: Media.Media }
  | { kind: "story"; item: Story.Story };

// ---------------------------------------------------------------------------
// Per-result row
// ---------------------------------------------------------------------------

const ResultRow: React.FC<{
  result: SearchResult;
  onClick: (r: SearchResult) => void;
}> = ({ result, onClick }) => {
  let content: React.ReactNode;

  if (result.kind === "actor") {
    content = (
      <ActorListItem
        displayFullName
        avatarSize="small"
        item={{ ...result.item, selected: false }}
      />
    );
  } else if (result.kind === "group") {
    content = (
      <GroupListItem
        avatarSize="small"
        displayName
        item={{ ...result.item, selected: false }}
      />
    );
  } else if (result.kind === "keyword") {
    content = <KeywordListItem item={{ ...result.item, selected: false }} />;
  } else {
    let label = "";
    if (result.kind === "event") {
      label =
        (result.item as any).payload?.title ??
        (result.item as any).payload?.excerpt ??
        result.item.id;
    } else if (result.kind === "link") {
      label =
        result.item.title ??
        result.item.description ??
        result.item.url ??
        result.item.id;
    } else if (result.kind === "media") {
      label =
        result.item.label ??
        result.item.description ??
        result.item.location ??
        result.item.id;
    } else if (result.kind === "area") {
      label = result.item.label ?? result.item.id;
    } else if (result.kind === "story") {
      label = result.item.title ?? result.item.id;
    }

    const icon =
      result.kind === "event" ? (
        <Icons.Assignment fontSize="small" />
      ) : result.kind === "link" ? (
        <LinkIcon />
      ) : result.kind === "area" ? (
        <AreaIcon />
      ) : result.kind === "story" ? (
        <Icons.StoryIcon fontSize="small" />
      ) : (
        <MediaIcon />
      );

    content = (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
        {icon}
        <ListItemText
          primary={label}
          primaryTypographyProps={{ noWrap: true, variant: "body2" }}
        />
      </Box>
    );
  }

  return (
    <MenuItem
      dense
      onClick={() => {
        onClick(result);
      }}
      sx={{ px: 1.5, py: 0.5 }}
    >
      {content}
    </MenuItem>
  );
};

// ---------------------------------------------------------------------------
// Main modal component
// ---------------------------------------------------------------------------

export interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  onResultClick: (result: SearchResult) => void;
}

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onClose,
  onResultClick,
}) => {
  const Queries = useEndpointQueries();

  /**
   * We use a `multiple` Autocomplete capped at 1 item so that the selected
   * resource type appears as an inline chip inside the input box. Once the
   * chip is present the dropdown is hidden (options=[]) and the user's
   * typing becomes the free-text search query — all in the same <input>.
   */
  const [selected, setSelected] = React.useState<ResourceTypeOption[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  const menuListRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resourceType = selected[0] ?? null;

  // Debounce the search term (only relevant after a type chip is set)
  React.useEffect(() => {
    if (resourceType === null) return;
    const t = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
    };
  }, [inputValue, resourceType]);

  // Reset everything when the modal closes
  React.useEffect(() => {
    if (!open) {
      setSelected([]);
      setInputValue("");
      setDebouncedQuery("");
    }
  }, [open]);

  const kind = resourceType?.value ?? null;
  const enabled = kind !== null && debouncedQuery.length >= MIN_QUERY_LENGTH;

  const baseQueryParams = {
    q: debouncedQuery,
    _sort: "createdAt" as const,
    _order: "DESC" as const,
  };

  const actorQuery = Queries.Actor.list.useQuery(undefined, baseQueryParams, !enabled || kind !== "actor");
  const groupQuery = Queries.Group.list.useQuery(undefined, baseQueryParams, !enabled || kind !== "group");
  const keywordQuery = Queries.Keyword.list.useQuery(undefined, baseQueryParams, !enabled || kind !== "keyword");
  const areaQuery = Queries.Area.list.useQuery(undefined, baseQueryParams, !enabled || kind !== "area");
  const eventQuery = Queries.Event.list.useQuery(undefined, baseQueryParams, !enabled || kind !== "event");
  const linkQuery = Queries.Link.list.useQuery(undefined, baseQueryParams, !enabled || kind !== "link");
  const mediaQuery = Queries.Media.list.useQuery(undefined, baseQueryParams, !enabled || kind !== "media");
  const storyQuery = Queries.Story.list.useQuery(undefined, baseQueryParams, !enabled || kind !== "story");

  const isLoading =
    actorQuery.isFetching ||
    groupQuery.isFetching ||
    keywordQuery.isFetching ||
    areaQuery.isFetching ||
    eventQuery.isFetching ||
    linkQuery.isFetching ||
    mediaQuery.isFetching ||
    storyQuery.isFetching;

  const results = React.useMemo<SearchResult[]>(() => {
    if (!enabled || kind === null) return [];
    if (kind === "actor") return (actorQuery.data?.data ?? []).map((item) => ({ kind: "actor", item }));
    if (kind === "group") return (groupQuery.data?.data ?? []).map((item) => ({ kind: "group", item }));
    if (kind === "keyword") return (keywordQuery.data?.data ?? []).map((item) => ({ kind: "keyword", item }));
    if (kind === "area") return (areaQuery.data?.data ?? []).map((item) => ({ kind: "area", item }));
    if (kind === "event") return ((eventQuery.data?.data as Events.Event[] | undefined) ?? []).map((item) => ({ kind: "event", item }));
    if (kind === "link") return (linkQuery.data?.data ?? []).map((item) => ({ kind: "link", item }));
    if (kind === "media") return (mediaQuery.data?.data ?? []).map((item) => ({ kind: "media", item }));
    if (kind === "story") return (storyQuery.data?.data ?? []).map((item) => ({ kind: "story", item }));
    return [];
  }, [enabled, kind, actorQuery.data, groupQuery.data, keywordQuery.data, areaQuery.data, eventQuery.data, linkQuery.data, mediaQuery.data, storyQuery.data]);

  const handleResultClick = (result: SearchResult): void => {
    onResultClick(result);
    onClose();
  };

  // ArrowDown from the text input → first result item
  const handleInputKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      menuListRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  // ArrowUp on first result item → back to input
  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLUListElement>): void => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowUp") {
      const focused = menuListRef.current?.querySelector<HTMLElement>("[role='menuitem']:focus");
      const first = menuListRef.current?.querySelector<HTMLElement>("[role='menuitem']:first-child");
      if (focused === first) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-label="Global search"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" fontWeight="bold">Search</Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close search">
            <Icons.Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/*
         * Single combined input (multiple Autocomplete, capped at 1 chip).
         *
         * Phase 1 — no chip: typing filters the resource-type dropdown;
         *   arrow keys + Enter select a type → chip appears inline.
         *
         * Phase 2 — chip present: dropdown is suppressed (options=[]);
         *   typing goes into the free-text search query; × on chip resets
         *   back to phase 1.
         */}
        <Autocomplete<ResourceTypeOption, true>
          multiple
          autoHighlight
          // Phase 1: open on focus and show all resource types.
          // Phase 2: render a no-op Popper so MUI never mounts the popup
          //   DOM node — prevents "No options" overlay and result dimming.
          openOnFocus={resourceType === null}
          open={resourceType !== null ? false : undefined}
          PopperComponent={resourceType !== null ? () => null : undefined}
          options={resourceType === null ? RESOURCE_TYPES : []}
          value={selected}
          inputValue={inputValue}
          onChange={(_e, newValue) => {
            // MUI passes the full array; we only ever want 0 or 1 entries.
            const latest = newValue[newValue.length - 1] ?? null;
            if (latest === null) {
              setSelected([]);
              setInputValue("");
              setDebouncedQuery("");
            } else {
              setSelected([latest]);
              setInputValue("");
              setDebouncedQuery("");
            }
          }}
          onInputChange={(_e, value, reason) => {
            // Don't let MUI reset the input after an option is picked
            if (reason === "reset" && resourceType !== null) return;
            setInputValue(value);
          }}
          getOptionLabel={(opt) => opt.label}
          isOptionEqualToValue={(opt, val) => opt.value === val.value}
          // Render each resource-type option in the dropdown with its icon
          renderOption={(props, opt) => (
            <Box
              component="li"
              {...props}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </Box>
          )}
          // Render the selected resource type as an inline chip inside the input
          renderTags={(value, getTagProps) =>
            value.map((opt, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  {...tagProps}
                  label={opt.label}
                  icon={opt.icon as React.ReactElement}
                  size="small"
                  color="primary"
                  onDelete={() => {
                    setSelected([]);
                    setInputValue("");
                    setDebouncedQuery("");
                  }}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              size="small"
              placeholder={
                resourceType !== null
                  ? `Search ${resourceType.label.toLowerCase()}...`
                  : "Select a resource type…"
              }
              inputRef={inputRef}
              onKeyDown={handleInputKeyDown}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                      <Icons.Search fontSize="small" color="action" />
                    </Box>
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <>
                    {isLoading ? <CircularProgress size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          sx={{ mb: 1.5 }}
        />

        {/* Hint / empty states */}
        {resourceType === null && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            Select a resource type to start searching
          </Typography>
        )}

        {resourceType !== null && !enabled && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            Type at least {MIN_QUERY_LENGTH} characters to search {resourceType.label.toLowerCase()}
          </Typography>
        )}

        {enabled && !isLoading && results.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            No results for &quot;{debouncedQuery}&quot;
          </Typography>
        )}

        {/* Results list — keyboard navigable */}
        {enabled && results.length > 0 && (
          <MenuList
            ref={menuListRef}
            dense
            disablePadding
            onKeyDown={handleMenuKeyDown}
            sx={{ py: 0 }}
          >
            {results.map((result, i) => (
              <ResultRow
                key={`${result.kind}-${result.item.id}-${i}`}
                result={result}
                onClick={handleResultClick}
              />
            ))}
          </MenuList>
        )}
      </DialogContent>
    </Dialog>
  );
};

export type { SearchResult };
