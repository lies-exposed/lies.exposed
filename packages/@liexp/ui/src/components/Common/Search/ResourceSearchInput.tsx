import * as React from "react";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Icons,
  TextField,
} from "../../mui/index.js";
import { type ResourceTypeOption, RESOURCE_TYPES } from "./types.js";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ResourceSearchInputProps {
  /** The currently selected resource type, or null when none is selected. */
  resourceType: ResourceTypeOption | null;
  /** The current free-text search value (phase 2 only). */
  searchValue: string;
  /** Whether a query is in flight — shows a loading spinner in the input. */
  isLoading?: boolean;
  /** Ref forwarded to the phase-2 TextField's underlying <input>. */
  searchInputRef?: React.Ref<HTMLInputElement>;
  /** Called when the user picks a resource type from the dropdown. */
  onResourceTypeChange: (option: ResourceTypeOption) => void;
  /** Called when the user clears the resource type chip. */
  onResourceTypeClear: () => void;
  /** Called when the free-text search value changes (phase 2 only). */
  onSearchValueChange: (value: string) => void;
  /** Called on keydown in the phase-2 search TextField. */
  onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Two-phase resource search input.
 *
 * Phase 1 — no resource type selected:
 *   Renders a MUI Autocomplete that lets the user pick one of the available
 *   resource types from a dropdown. Arrow keys + Enter work out of the box.
 *
 * Phase 2 — resource type selected:
 *   Replaces the Autocomplete with a plain TextField + inline Chip. This
 *   avoids all MUI Popper/popup machinery so the "No options" overlay and
 *   result-list dimming can never appear.
 */
export const ResourceSearchInput: React.FC<ResourceSearchInputProps> = ({
  resourceType,
  searchValue,
  isLoading = false,
  searchInputRef,
  onResourceTypeChange,
  onResourceTypeClear,
  onSearchValueChange,
  onSearchKeyDown,
}) => {
  if (resourceType === null) {
    return (
      <Autocomplete<ResourceTypeOption, true>
        multiple
        autoHighlight
        openOnFocus
        options={RESOURCE_TYPES}
        value={[]}
        inputValue={searchValue}
        onChange={(_e, newValue) => {
          const latest = newValue[newValue.length - 1] ?? null;
          if (latest !== null) {
            onResourceTypeChange(latest);
          }
        }}
        onInputChange={(_e, value) => {
          onSearchValueChange(value);
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
        renderTags={() => null}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus
            size="small"
            placeholder="Select a resource type…"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                  <Icons.Search fontSize="small" color="action" />
                </Box>
              ),
            }}
          />
        )}
        sx={{ mb: 1.5 }}
      />
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      <Box sx={{ mr: 0.5, display: "flex", alignItems: "center" }}>
        <Icons.Search fontSize="small" color="action" />
      </Box>
      <Chip
        label={resourceType.label}
        icon={resourceType.icon as React.ReactElement}
        size="small"
        color="primary"
        onDelete={onResourceTypeClear}
      />
      <TextField
        autoFocus
        size="small"
        variant="standard"
        placeholder={`Search ${resourceType.label.toLowerCase()}...`}
        value={searchValue}
        inputRef={searchInputRef}
        onChange={(e) => {
          onSearchValueChange(e.target.value);
        }}
        onKeyDown={onSearchKeyDown}
        InputProps={{
          disableUnderline: true,
          endAdornment: isLoading ? <CircularProgress size={16} /> : null,
        }}
        sx={{ flex: 1 }}
      />
    </Box>
  );
};
