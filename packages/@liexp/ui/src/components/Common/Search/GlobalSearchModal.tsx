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
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Icons,
  ListItemText,
  MenuItem,
  MenuList,
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
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
      >
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

  const [resourceType, setResourceType] =
    React.useState<ResourceTypeOption | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  const inputRef = React.useRef<HTMLInputElement>(null);
  const menuListRef = React.useRef<HTMLUListElement>(null);

  // Chip highlighted by the current input text (before explicit selection)
  const highlighted = React.useMemo<ResourceTypeOption | null>(() => {
    if (resourceType !== null) return null;
    const q = inputValue.trim().toLowerCase();
    if (q.length === 0) return null;
    return (
      RESOURCE_TYPES.find((rt) => rt.label.toLowerCase().startsWith(q)) ?? null
    );
  }, [inputValue, resourceType]);

  // Debounce the search query
  React.useEffect(() => {
    if (resourceType === null) return;
    const t = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
    };
  }, [inputValue, resourceType]);

  // Reset when modal closes
  React.useEffect(() => {
    if (!open) {
      setResourceType(null);
      setInputValue("");
      setDebouncedQuery("");
    }
  }, [open]);

  // Focus the input after selecting a resource type
  React.useEffect(() => {
    if (resourceType !== null) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [resourceType]);

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

  const selectResourceType = (rt: ResourceTypeOption): void => {
    setResourceType(rt);
    setInputValue("");
    setDebouncedQuery("");
  };

  const clearResourceType = (): void => {
    setResourceType(null);
    setInputValue("");
    setDebouncedQuery("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent): void => {
    // Enter confirms a highlighted chip if no resource is selected yet
    if (e.key === "Enter" && resourceType === null && highlighted !== null) {
      e.preventDefault();
      selectResourceType(highlighted);
      return;
    }
    // ArrowDown → first result
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      menuListRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
      return;
    }
    // Backspace with empty input and a resource selected → clear it
    if (e.key === "Backspace" && inputValue === "" && resourceType !== null) {
      clearResourceType();
      return;
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

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
        {/* Resource type chips — always visible */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            mb: 1.25,
          }}
        >
          {RESOURCE_TYPES.map((rt) => {
            const isSelected = resourceType?.value === rt.value;
            const isHighlighted =
              !isSelected && highlighted?.value === rt.value;
            return (
              <Chip
                key={rt.value}
                label={rt.label}
                icon={rt.icon as React.ReactElement}
                size="small"
                clickable
                onClick={() => {
                  if (isSelected) {
                    clearResourceType();
                  } else {
                    selectResourceType(rt);
                  }
                }}
                color={isSelected || isHighlighted ? "primary" : "default"}
                variant={isSelected ? "filled" : isHighlighted ? "filled" : "outlined"}
                sx={
                  isHighlighted && !isSelected
                    ? { opacity: 0.75 }
                    : undefined
                }
              />
            );
          })}
        </Box>

        {/* Search input */}
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder={
            resourceType !== null
              ? `Search ${resourceType.label.toLowerCase()}...`
              : "Type a resource name or select above…"
          }
          value={inputValue}
          inputRef={inputRef}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onKeyDown={handleInputKeyDown}
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

        {/* Hint / empty states */}
        {resourceType === null && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            {highlighted !== null
              ? `Press Enter to search ${highlighted.label.toLowerCase()}`
              : "Select a resource type to start searching"}
          </Typography>
        )}

        {resourceType !== null && !enabled && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            Type at least {MIN_QUERY_LENGTH} characters to search{" "}
            {resourceType.label.toLowerCase()}
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
