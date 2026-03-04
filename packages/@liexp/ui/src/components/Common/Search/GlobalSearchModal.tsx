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
  List,
  ListItem,
  ListItemButton,
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
  | "all"
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
  { value: "all", label: "All", icon: <Icons.Search fontSize="small" /> },
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
  const handleClick = (): void => {
    onClick(result);
  };

  if (result.kind === "actor") {
    return (
      <ListItemButton onClick={handleClick} dense>
        <ActorListItem
          displayFullName
          avatarSize="small"
          item={{ ...result.item, selected: false }}
        />
      </ListItemButton>
    );
  }

  if (result.kind === "group") {
    return (
      <ListItemButton onClick={handleClick} dense>
        <GroupListItem
          avatarSize="small"
          displayName
          item={{ ...result.item, selected: false }}
        />
      </ListItemButton>
    );
  }

  if (result.kind === "keyword") {
    return (
      <ListItemButton onClick={handleClick} dense>
        <KeywordListItem item={{ ...result.item, selected: false }} />
      </ListItemButton>
    );
  }

  // event / link / media / area / story — generic label row
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

  return (
    <ListItemButton onClick={handleClick} dense>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%",
        }}
      >
        {icon}
        <ListItemText
          primary={label}
          primaryTypographyProps={{ noWrap: true, variant: "body2" }}
        />
      </Box>
    </ListItemButton>
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

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onClose,
  onResultClick,
}) => {
  const Queries = useEndpointQueries();

  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [resourceType, setResourceType] =
    React.useState<SearchResourceType>("all");

  // Debounce query input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setResourceType("all");
    }
  }, [open]);

  const enabled = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const baseQueryParams = {
    q: debouncedQuery,
    _sort: "createdAt" as const,
    _order: "DESC" as const,
  };

  const includeActors = resourceType === "all" || resourceType === "actor";
  const includeGroups = resourceType === "all" || resourceType === "group";
  const includeKeywords = resourceType === "all" || resourceType === "keyword";
  const includeAreas = resourceType === "all" || resourceType === "area";
  const includeEvents = resourceType === "all" || resourceType === "event";
  const includeLinks = resourceType === "all" || resourceType === "link";
  const includeMedia = resourceType === "all" || resourceType === "media";
  const includeStories = resourceType === "all" || resourceType === "story";

  const actorQuery = Queries.Actor.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || !includeActors,
  );
  const groupQuery = Queries.Group.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || !includeGroups,
  );
  const keywordQuery = Queries.Keyword.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || !includeKeywords,
  );
  const areaQuery = Queries.Area.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || !includeAreas,
  );
  const eventQuery = Queries.Event.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || !includeEvents,
  );
  const linkQuery = Queries.Link.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || !includeLinks,
  );
  const mediaQuery = Queries.Media.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || !includeMedia,
  );
  const storyQuery = Queries.Story.list.useQuery(
    undefined,
    baseQueryParams,
    !enabled || !includeStories,
  );

  const isLoading =
    (includeActors && actorQuery.isFetching) ||
    (includeGroups && groupQuery.isFetching) ||
    (includeKeywords && keywordQuery.isFetching) ||
    (includeAreas && areaQuery.isFetching) ||
    (includeEvents && eventQuery.isFetching) ||
    (includeLinks && linkQuery.isFetching) ||
    (includeMedia && mediaQuery.isFetching) ||
    (includeStories && storyQuery.isFetching);

  const results = React.useMemo<SearchResult[]>(() => {
    if (!enabled) return [];

    const actors: SearchResult[] = includeActors
      ? (actorQuery.data?.data ?? []).map((item) => ({ kind: "actor", item }))
      : [];
    const groups: SearchResult[] = includeGroups
      ? (groupQuery.data?.data ?? []).map((item) => ({ kind: "group", item }))
      : [];
    const keywords: SearchResult[] = includeKeywords
      ? (keywordQuery.data?.data ?? []).map((item) => ({
          kind: "keyword",
          item,
        }))
      : [];
    const areas: SearchResult[] = includeAreas
      ? (areaQuery.data?.data ?? []).map((item) => ({ kind: "area", item }))
      : [];
    const events: SearchResult[] = includeEvents
      ? ((eventQuery.data?.data as Events.Event[] | undefined) ?? []).map(
          (item) => ({ kind: "event", item }),
        )
      : [];
    const links: SearchResult[] = includeLinks
      ? (linkQuery.data?.data ?? []).map((item) => ({ kind: "link", item }))
      : [];
    const media: SearchResult[] = includeMedia
      ? (mediaQuery.data?.data ?? []).map((item) => ({ kind: "media", item }))
      : [];
    const stories: SearchResult[] = includeStories
      ? (storyQuery.data?.data ?? []).map((item) => ({ kind: "story", item }))
      : [];

    return [
      ...actors,
      ...groups,
      ...keywords,
      ...areas,
      ...events,
      ...links,
      ...media,
      ...stories,
    ];
  }, [
    enabled,
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

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      onKeyDown={handleKeyDown}
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
        {/* Text input */}
        <TextField
          autoFocus
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search across all entities..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
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

        {/* Resource type chips */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            mb: 1.5,
          }}
        >
          {RESOURCE_TYPES.map((rt) => (
            <Chip
              key={rt.value}
              label={rt.label}
              icon={rt.icon as React.ReactElement}
              size="small"
              variant={resourceType === rt.value ? "filled" : "outlined"}
              color={resourceType === rt.value ? "primary" : "default"}
              onClick={() => {
                setResourceType(rt.value);
              }}
              clickable
            />
          ))}
        </Box>

        {/* Results */}
        {!enabled && (
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

        {enabled && results.length > 0 && (
          <List dense disablePadding>
            {results.map((result, i) => (
              <ListItem
                key={`${result.kind}-${result.item.id}-${i}`}
                disablePadding
              >
                <ResultRow result={result} onClick={handleResultClick} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export type { SearchResult };
