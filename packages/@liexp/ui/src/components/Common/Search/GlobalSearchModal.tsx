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
// Per-result row — rendered as a MenuItem so MUI handles arrow-key focus
// ---------------------------------------------------------------------------

const ResultRow: React.FC<{
  result: SearchResult;
  onClick: (r: SearchResult) => void;
}> = ({ result, onClick }) => {
  const handleClick = (): void => {
    onClick(result);
  };

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
    <MenuItem dense onClick={handleClick} sx={{ px: 1.5, py: 0.5 }}>
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
  /** Called when the user clicks a result. Receives typed result for routing. */
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

  // Step 1: resource type (null = not yet chosen)
  const [resourceType, setResourceType] =
    React.useState<ResourceTypeOption | null>(null);

  // Step 2: search term
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const menuListRef = React.useRef<HTMLUListElement>(null);

  // Debounce query input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Focus the search input once a resource type is chosen
  React.useEffect(() => {
    if (resourceType !== null) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [resourceType]);

  // Reset all state when modal closes
  React.useEffect(() => {
    if (!open) {
      setResourceType(null);
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  const enabled =
    resourceType !== null && debouncedQuery.length >= MIN_QUERY_LENGTH;

  const baseQueryParams = {
    q: debouncedQuery,
    _sort: "createdAt" as const,
    _order: "DESC" as const,
  };

  const kind = resourceType?.value ?? null;

  const actorQuery = Queries.Actor.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || kind !== "actor",
  );
  const groupQuery = Queries.Group.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || kind !== "group",
  );
  const keywordQuery = Queries.Keyword.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || kind !== "keyword",
  );
  const areaQuery = Queries.Area.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || kind !== "area",
  );
  const eventQuery = Queries.Event.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || kind !== "event",
  );
  const linkQuery = Queries.Link.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || kind !== "link",
  );
  const mediaQuery = Queries.Media.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || kind !== "media",
  );
  const storyQuery = Queries.Story.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || kind !== "story",
  );

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

    if (kind === "actor")
      return (actorQuery.data?.data ?? []).map((item) => ({
        kind: "actor",
        item,
      }));
    if (kind === "group")
      return (groupQuery.data?.data ?? []).map((item) => ({
        kind: "group",
        item,
      }));
    if (kind === "keyword")
      return (keywordQuery.data?.data ?? []).map((item) => ({
        kind: "keyword",
        item,
      }));
    if (kind === "area")
      return (areaQuery.data?.data ?? []).map((item) => ({
        kind: "area",
        item,
      }));
    if (kind === "event")
      return ((eventQuery.data?.data as Events.Event[] | undefined) ?? []).map(
        (item) => ({ kind: "event", item }),
      );
    if (kind === "link")
      return (linkQuery.data?.data ?? []).map((item) => ({
        kind: "link",
        item,
      }));
    if (kind === "media")
      return (mediaQuery.data?.data ?? []).map((item) => ({
        kind: "media",
        item,
      }));
    if (kind === "story")
      return (storyQuery.data?.data ?? []).map((item) => ({
        kind: "story",
        item,
      }));
    return [];
  }, [
    enabled,
    kind,
    actorQuery.data,
    groupQuery.data,
    keywordQuery.data,
    areaQuery.data,
    eventQuery.data,
    linkQuery.data,
    mediaQuery.data,
    storyQuery.data,
  ]);

  const handleResultClick = (result: SearchResult): void => {
    onResultClick(result);
    onClose();
  };

  // ArrowDown from the search TextField moves focus to the first menu item
  const handleSearchKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      const first = menuListRef.current?.querySelector<HTMLElement>(
        "[role='menuitem']",
      );
      first?.focus();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  // ArrowUp on first menu item returns focus to search input
  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLUListElement>): void => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowUp") {
      const focused = menuListRef.current?.querySelector<HTMLElement>(
        "[role='menuitem']:focus",
      );
      const first = menuListRef.current?.querySelector<HTMLElement>(
        "[role='menuitem']:first-child",
      );
      if (focused === first) {
        e.preventDefault();
        searchInputRef.current?.focus();
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Search
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close search">
            <Icons.Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Step 1: resource type autocomplete */}
        <Autocomplete<ResourceTypeOption>
          autoHighlight
          openOnFocus
          options={RESOURCE_TYPES}
          value={resourceType}
          onChange={(_e, value) => {
            setResourceType(value);
            setQuery("");
            setDebouncedQuery("");
          }}
          getOptionLabel={(opt) => opt.label}
          isOptionEqualToValue={(opt, val) => opt.value === val.value}
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
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              placeholder="Select a resource type..."
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: resourceType !== null ? (
                  <Box sx={{ mr: 0.5, display: "flex", alignItems: "center" }}>
                    {resourceType.icon}
                  </Box>
                ) : (
                  <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                    <Icons.Search fontSize="small" color="action" />
                  </Box>
                ),
              }}
            />
          )}
          renderTags={() => null}
          sx={{ mb: 1.5 }}
        />

        {/* Step 2: search term input — only shown once a resource is selected */}
        {resourceType !== null && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip
                label={resourceType.label}
                icon={resourceType.icon as React.ReactElement}
                size="small"
                color="primary"
                onDelete={() => {
                  setResourceType(null);
                  setQuery("");
                  setDebouncedQuery("");
                }}
              />
              <Typography variant="caption" color="text.secondary">
                — type to search
              </Typography>
            </Box>

            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder={`Search ${resourceType.label.toLowerCase()}...`}
              value={query}
              inputRef={searchInputRef}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onKeyDown={handleSearchKeyDown}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                    <Icons.Search fontSize="small" color="action" />
                  </Box>
                ),
                endAdornment: isLoading ? (
                  <CircularProgress size={16} />
                ) : undefined,
              }}
              sx={{ mb: 1.5 }}
            />
          </>
        )}

        {/* Empty/hint states */}
        {resourceType === null && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            Select a resource type above to start searching
          </Typography>
        )}

        {resourceType !== null && !enabled && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            Type at least {MIN_QUERY_LENGTH} characters to search
          </Typography>
        )}

        {enabled && !isLoading && results.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            No results for &quot;{debouncedQuery}&quot;
          </Typography>
        )}

        {/* Results list */}
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
