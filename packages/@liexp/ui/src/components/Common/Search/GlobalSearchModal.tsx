import { type Events } from "@liexp/io/lib/http/index.js";
import * as React from "react";
import { useEndpointQueries } from "../../../hooks/useEndpointQueriesProvider.js";
import { ActorListItem } from "../../lists/ActorList.js";
import { GroupListItem } from "../../lists/GroupList.js";
import { KeywordListItem } from "../../lists/KeywordList.js";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Icons,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from "../../mui/index.js";
import { AreaIcon, LinkIcon, MediaIcon } from "../Icons/FAIcon.js";
import { ResourceSearchInput } from "./ResourceSearchInput.js";
import {
  type ResourceTypeOption,
  type SearchResourceType,
  type SearchResult,
} from "./types.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

// ---------------------------------------------------------------------------
// ResultRow — private file-local subcomponent
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
        item={{ ...result.item, selected: true }}
      />
    );
  } else if (result.kind === "group") {
    content = (
      <GroupListItem
        avatarSize="small"
        displayName
        item={{ ...result.item, selected: true }}
      />
    );
  } else if (result.kind === "keyword") {
    content = <KeywordListItem item={{ ...result.item, selected: true }} />;
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
    }

    const icon =
      result.kind === "event" ? (
        <Icons.Assignment fontSize="small" />
      ) : result.kind === "link" ? (
        <LinkIcon />
      ) : result.kind === "area" ? (
        <AreaIcon />
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
// useResourceSearch — encapsulates query + debounce logic
// ---------------------------------------------------------------------------

interface UseResourceSearchResult {
  results: SearchResult[];
  isLoading: boolean;
}

const useResourceSearch = (
  kind: SearchResourceType | null,
  debouncedQuery: string,
): UseResourceSearchResult => {
  const Queries = useEndpointQueries();

  const enabled = kind !== null && debouncedQuery.length >= MIN_QUERY_LENGTH;
  const params = {
    q: debouncedQuery,
    _sort: "createdAt" as const,
    _order: "DESC" as const,
  };

  const actorQuery = Queries.Actor.list.useQuery(
    undefined,
    params,
    !enabled || kind !== "actor",
  );
  const groupQuery = Queries.Group.list.useQuery(
    undefined,
    params,
    !enabled || kind !== "group",
  );
  const keywordQuery = Queries.Keyword.list.useQuery(
    undefined,
    params,
    !enabled || kind !== "keyword",
  );
  const areaQuery = Queries.Area.list.useQuery(
    undefined,
    params,
    !enabled || kind !== "area",
  );
  const eventQuery = Queries.Event.list.useQuery(
    undefined,
    params,
    !enabled || kind !== "event",
  );
  const linkQuery = Queries.Link.list.useQuery(
    undefined,
    params,
    !enabled || kind !== "link",
  );
  const mediaQuery = Queries.Media.list.useQuery(
    undefined,
    params,
    !enabled || kind !== "media",
  );

  const isLoading =
    actorQuery.isFetching ||
    groupQuery.isFetching ||
    keywordQuery.isFetching ||
    areaQuery.isFetching ||
    eventQuery.isFetching ||
    linkQuery.isFetching ||
    mediaQuery.isFetching;

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
  ]);

  return { results, isLoading };
};

// ---------------------------------------------------------------------------
// GlobalSearchModal
// ---------------------------------------------------------------------------

export interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  onResultClick: (result: SearchResult) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onClose,
  onResultClick,
}) => {
  const [resourceType, setResourceType] =
    React.useState<ResourceTypeOption | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  const menuListRef = React.useRef<HTMLUListElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Debounce the search term once a resource type is selected
  React.useEffect(() => {
    if (resourceType === null) return;
    const t = setTimeout(() => {
      setDebouncedQuery(searchValue);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
    };
  }, [searchValue, resourceType]);

  // Reset all state when the modal closes
  React.useEffect(() => {
    if (!open) {
      setResourceType(null);
      setSearchValue("");
      setDebouncedQuery("");
    }
  }, [open]);

  const { results, isLoading } = useResourceSearch(
    resourceType?.value ?? null,
    debouncedQuery,
  );

  const enabled =
    resourceType !== null && debouncedQuery.length >= MIN_QUERY_LENGTH;

  const handleResultClick = (result: SearchResult): void => {
    onResultClick(result);
    onClose();
  };

  const handleResourceTypeChange = (option: ResourceTypeOption): void => {
    setResourceType(option);
    setSearchValue("");
    setDebouncedQuery("");
    // Shift focus to the search TextField once it mounts
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleResourceTypeClear = (): void => {
    setResourceType(null);
    setSearchValue("");
    setDebouncedQuery("");
  };

  // ArrowDown from the search input → first result row
  const handleSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      menuListRef.current
        ?.querySelector<HTMLElement>("[role='menuitem']")
        ?.focus();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  // ArrowUp on first result row → back to search input; Escape → close
  const handleMenuKeyDown = (
    e: React.KeyboardEvent<HTMLUListElement>,
  ): void => {
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
        <ResourceSearchInput
          resourceType={resourceType}
          searchValue={searchValue}
          isLoading={isLoading}
          searchInputRef={searchInputRef}
          onResourceTypeChange={handleResourceTypeChange}
          onResourceTypeClear={handleResourceTypeClear}
          onSearchValueChange={setSearchValue}
          onSearchKeyDown={handleSearchKeyDown}
        />

        {resourceType === null && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            Select a resource type to start searching
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

export type { SearchResult, SearchResourceType };
