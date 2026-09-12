import { formatDistanceToNow } from "date-fns";
import debounce from "lodash/debounce.js";
import omit from "lodash/omit.js";
import pick from "lodash/pick.js";
import * as React from "react";
import { useRecordContext, useResourceContext } from "react-admin";
import { useFormContext, useFormState, useWatch } from "react-hook-form";

const STORAGE_PREFIX = "liexp:autosave:";
const DEFAULT_DEBOUNCE_MS = 1500;

interface StoredDraft {
  savedAt: number;
  values: Record<string, unknown>;
}

export interface UseFormAutosaveOptions {
  /**
   * Disable persistence entirely (e.g. while the record is still loading, or
   * for users without write access).
   */
  disabled?: boolean;
  /** Debounce window for local writes, in ms. Default 1500. */
  debounceMs?: number;
  /**
   * Restrict the cached snapshot to these form paths. Use it to autosave only
   * the expensive-to-retype fields (e.g. `["body2"]` for the story editor)
   * instead of the whole form. Takes precedence over `excludePaths`.
   */
  includePaths?: string[];
  /**
   * Form paths to leave out of the cached snapshot — use it for fields that
   * hold non-serializable data (pending `File` uploads) where a partial
   * round-trip would be worse than not restoring them. Ignored when
   * `includePaths` is set.
   */
  excludePaths?: string[];
  /**
   * Explicit storage key suffix. Defaults to `<resource>:<recordId|new>`, which
   * is what you want unless two forms edit the same record on one page.
   */
  storageKey?: string;
}

export interface UseFormAutosaveResult {
  /**
   * A locally cached draft that is newer than the persisted record, detected
   * once on mount. `null` when there is nothing to recover.
   */
  draft: { savedAt: number; savedAtLabel: string } | null;
  /** Re-hydrate the form with the cached draft values. */
  restore: () => void;
  /** Drop the cached draft and hide the recovery notice. */
  discard: () => void;
  /** Timestamp (ms) of the last successful local write, or `null`. */
  lastSavedAt: number | null;
}

const canUseStorage = (): boolean => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

// Pending uploads (`File`/`Blob`) and functions cannot survive JSON; drop them
// rather than let `JSON.stringify` throw or emit `{}`.
const replacer = (_key: string, value: unknown): unknown => {
  if (typeof File !== "undefined" && value instanceof File) return undefined;
  if (typeof Blob !== "undefined" && value instanceof Blob) return undefined;
  if (typeof value === "function") return undefined;
  return value;
};

const readDraft = (key: string): StoredDraft | null => {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (
      typeof parsed?.savedAt !== "number" ||
      typeof parsed?.values !== "object" ||
      parsed.values === null
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeDraft = (key: string, draft: StoredDraft): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(draft, replacer));
  } catch {
    // Quota exceeded or a value that cannot be serialized — autosave is
    // best-effort, so swallow it.
  }
};

const clearDraft = (key: string): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

/**
 * Persist the current react-admin form to `localStorage` while it is being
 * edited, and offer to restore it after an accidental reload or crash.
 *
 * Must be used inside a react-admin `<SimpleForm>` / `<TabbedForm>` (it reads
 * the react-hook-form and record contexts). The cache is cleared on a
 * successful submit and on an explicit discard.
 */
export const useFormAutosave = (
  options: UseFormAutosaveOptions = {},
): UseFormAutosaveResult => {
  const {
    disabled = false,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    includePaths,
    excludePaths,
    storageKey,
  } = options;

  const resource = useResourceContext();
  const record = useRecordContext();
  const { reset, getValues } = useFormContext();
  const { isDirty, isSubmitSuccessful } = useFormState();
  const values = useWatch();

  const recordId = record?.id != null ? String(record.id) : "new";
  const key = React.useMemo(
    () =>
      STORAGE_PREFIX + (storageKey ?? `${resource ?? "unknown"}:${recordId}`),
    [storageKey, resource, recordId],
  );

  const recordUpdatedAt = React.useMemo(() => {
    const raw = record?.updatedAt ?? record?.createdAt;
    const t = raw ? new Date(raw as string).getTime() : Number.NaN;
    return Number.isNaN(t) ? 0 : t;
  }, [record?.updatedAt, record?.createdAt]);

  const [draft, setDraft] =
    React.useState<UseFormAutosaveResult["draft"]>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);

  // Detect a pre-existing draft exactly once per storage key.
  const detectedForKey = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (disabled || detectedForKey.current === key) return;
    detectedForKey.current = key;
    const stored = readDraft(key);
    if (stored && stored.savedAt > recordUpdatedAt) {
      setDraft({
        savedAt: stored.savedAt,
        savedAtLabel: formatDistanceToNow(stored.savedAt, {
          addSuffix: true,
        }),
      });
    } else if (stored) {
      // The persisted record is newer than the cache — drop the stale copy.
      clearDraft(key);
    }
  }, [key, disabled, recordUpdatedAt]);

  const persist = React.useMemo(
    () =>
      debounce((snapshot: Record<string, unknown>) => {
        const savedAt = Date.now();
        writeDraft(key, { savedAt, values: snapshot });
        setLastSavedAt(savedAt);
      }, debounceMs),
    [key, debounceMs],
  );

  // Write on every (debounced) change, but only once the user has actually
  // touched the form and while it has not just been submitted.
  React.useEffect(() => {
    if (disabled || !isDirty || isSubmitSuccessful) return;
    let snapshot: Record<string, unknown>;
    if (includePaths && includePaths.length > 0) {
      snapshot = pick(values, includePaths) as Record<string, unknown>;
    } else if (excludePaths && excludePaths.length > 0) {
      snapshot = omit(values, excludePaths) as Record<string, unknown>;
    } else {
      snapshot = values as Record<string, unknown>;
    }
    persist(snapshot);
  }, [
    values,
    isDirty,
    isSubmitSuccessful,
    disabled,
    includePaths,
    excludePaths,
    persist,
  ]);

  // Flush a pending write if the tab is closed or hidden mid-edit.
  React.useEffect(() => {
    if (disabled || typeof window === "undefined") return;
    const flush = (): void => {
      persist.flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", flush);
      persist.cancel();
    };
  }, [persist, disabled]);

  // Once the record reaches the API, the cache has served its purpose.
  React.useEffect(() => {
    if (!isSubmitSuccessful) return;
    persist.cancel();
    clearDraft(key);
    setDraft(null);
    setLastSavedAt(null);
  }, [isSubmitSuccessful, key, persist]);

  const restore = React.useCallback(() => {
    const stored = readDraft(key);
    if (!stored) {
      setDraft(null);
      return;
    }
    // `keepDefaultValues` leaves the original record as the dirty baseline, so
    // the Save button lights up after a restore.
    reset({ ...getValues(), ...stored.values }, { keepDefaultValues: true });
    setDraft(null);
  }, [key, reset, getValues]);

  const discard = React.useCallback(() => {
    persist.cancel();
    clearDraft(key);
    setDraft(null);
    setLastSavedAt(null);
  }, [key, persist]);

  return { draft, restore, discard, lastSavedAt };
};
