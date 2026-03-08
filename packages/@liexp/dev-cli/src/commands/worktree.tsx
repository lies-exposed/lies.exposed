import { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";
import { exec } from "../lib/exec.js";
import {
  listWorktrees,
  worktreeAddArgs,
  worktreeRemoveArgs,
  WORKTREE_PRUNE_ARGS,
  WORKTREES_DIR,
  worktreePath,
  copyEnvFiles,
  type WorktreeInfo,
} from "../lib/worktree.js";
import { openInTmuxPane, isInsideTmux } from "../lib/tmux.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubCommand = "menu" | "list" | "add" | "remove" | "prune" | "open";
type Phase = "input" | "running" | "done";

type Props = {
  /** Pre-selected sub-command (non-interactive mode). */
  preSubCommand?: SubCommand;
  /** Branch/worktree name for non-interactive add/remove. */
  preName?: string;
  /** For non-interactive add: create a new branch instead of checking out existing. */
  preNewBranch?: boolean;
  /** For non-interactive add --new-branch: base branch. Defaults to "main". */
  preBase?: string;
  /** For non-interactive remove: force-remove. */
  preForce?: boolean;
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

// ---------------------------------------------------------------------------
// Sub-menu
// ---------------------------------------------------------------------------

const SUB_MENU_ITEMS = [
  { label: "list",   value: "list"   as SubCommand, description: "List all worktrees" },
  { label: "open",   value: "open"   as SubCommand, description: "Open a worktree in a new tmux pane" },
  { label: "add",    value: "add"    as SubCommand, description: `Add a worktree under ${WORKTREES_DIR}/` },
  { label: "remove", value: "remove" as SubCommand, description: "Remove a worktree" },
  { label: "prune",  value: "prune"  as SubCommand, description: "Prune stale worktree metadata" },
];

// ---------------------------------------------------------------------------
// WorktreeCommand
// ---------------------------------------------------------------------------

export function WorktreeCommand({
  preSubCommand,
  preName,
  preNewBranch = false,
  preBase = "main",
  preForce = false,
  onBack,
  onPhaseChange,
}: Props) {
  const [subCmd, setSubCmd] = useState<SubCommand | null>(preSubCommand ?? null);

  useInput((_input, key) => {
    if (!key.escape) return;
    if (subCmd === null || subCmd === "menu" || preSubCommand) {
      onBack?.();
    } else {
      setSubCmd(null);
      onPhaseChange?.("idle");
    }
  });

  if (subCmd === null) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Git Worktrees</Text>
        <Text dimColor>Select an action:</Text>
        <SelectInput
          items={SUB_MENU_ITEMS}
          onSelect={(item) => {
            setSubCmd(item.value);
            onPhaseChange?.("idle");
          }}
          itemComponent={({ isSelected, label }) => {
            const desc = SUB_MENU_ITEMS.find((i) => i.label === label)?.description ?? "";
            return (
              <Box gap={2}>
                <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>{label}</Text>
                <Text dimColor>{desc}</Text>
              </Box>
            );
          }}
        />
      </Box>
    );
  }

  const goBack = () => {
    if (preSubCommand) {
      onBack?.();
    } else {
      setSubCmd(null);
      onPhaseChange?.("idle");
    }
  };

  switch (subCmd) {
    case "list":
      return <ListWorktrees onBack={goBack} />;
    case "open":
      return <OpenWorktree onBack={goBack} />;
    case "add":
      return (
        <AddWorktree
          preName={preName}
          preNewBranch={preNewBranch}
          preBase={preBase}
          onBack={goBack}
          onPhaseChange={onPhaseChange}
        />
      );
    case "remove":
      return <RemoveWorktree preName={preName} preForce={preForce} onBack={goBack} onPhaseChange={onPhaseChange} />;
    case "prune":
      return <PruneWorktrees onBack={goBack} onPhaseChange={onPhaseChange} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

function ListWorktrees({ onBack }: { onBack?: () => void; onPhaseChange?: (phase: "idle" | "running" | "done") => void }) {
  const [worktrees, setWorktrees] = useState<WorktreeInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listWorktrees()
      .then(setWorktrees)
      .catch((e: unknown) => setError(String(e)));
  }, []);

  useInput((_input, key) => {
    if (key.escape) onBack?.();
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Active worktrees</Text>

      {worktrees === null && error === null && (
        <Text dimColor>Loading…</Text>
      )}

      {error && <Text color="red">{error}</Text>}

      {worktrees && worktrees.length === 0 && (
        <Text dimColor>No worktrees found.</Text>
      )}

      {worktrees && worktrees.map((wt) => (
        <Box key={wt.path} gap={2}>
          <Text color={wt.isMain ? "green" : "cyan"}>{wt.branch}</Text>
          <Text dimColor>{wt.path}</Text>
          {wt.isMain && <Text dimColor>(main)</Text>}
        </Box>
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Open in tmux
// ---------------------------------------------------------------------------

function OpenWorktree({ onBack }: { onBack?: () => void }) {
  const [worktrees, setWorktrees] = useState<WorktreeInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    listWorktrees()
      .then((wts: WorktreeInfo[]) => {
        setWorktrees(wts);
      })
      .catch((e: unknown) => setError(String(e)));
  }, []);

  useInput((_input, key) => {
    if (key.escape) { onBack?.(); return; }

    if (worktrees === null || result !== null) return;

    if (key.upArrow) {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.downArrow) {
      setCursor((c) => Math.min(worktrees.length - 1, c + 1));
    } else if (key.return) {
      const wt = worktrees[cursor];
      if (!wt) return;
      if (!isInsideTmux()) {
        setResult("error: not running inside a tmux session (TMUX env var not set)");
        return;
      }
      openInTmuxPane(wt.path).then((res) => {
        if (res.ok) {
          setResult(`opened window for ${wt.branch}`);
        } else {
          setResult(`error: ${res.message}`);
        }
      }).catch((e: unknown) => setResult(`error: ${String(e)}`));
    }
  });

  if (error) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Open worktree in tmux</Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Open worktree in tmux</Text>

      {worktrees === null && <Text dimColor>Loading…</Text>}

      {worktrees !== null && worktrees.length === 0 && (
        <Text dimColor>No worktrees found.</Text>
      )}

      {worktrees !== null && worktrees.length > 0 && result === null && (
        <>
          <Text dimColor>↑/↓ move  ·  enter open in new tmux pane  ·  esc back</Text>
          {worktrees.map((wt, idx) => (
            <Box key={wt.path} gap={1}>
              <Text color={idx === cursor ? "cyan" : undefined}>
                {idx === cursor ? "›" : " "}
              </Text>
              <Text color={wt.isMain ? "green" : "white"}>
                {wt.branch}
              </Text>
              <Text dimColor>{wt.path}</Text>
              {wt.isMain && <Text dimColor>(main)</Text>}
            </Box>
          ))}
        </>
      )}

      {result !== null && (
        <Box flexDirection="column" gap={1} marginTop={1}>
          <Text color={result.startsWith("error") ? "red" : "green"}>{result}</Text>
          <Text dimColor>Press esc to go back.</Text>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Add
// ---------------------------------------------------------------------------

type AddPhase =
  | "inputName"
  | "inputMode"
  | "inputBase"
  | "inputDb"
  | "inputSeed"
  | "running"
  | "copyingEnv"
  | "seeding"
  | "done";

const MODE_ITEMS = [
  { label: "checkout existing branch", value: "existing" },
  { label: "create new branch",        value: "new" },
];

const SEED_ITEMS = [
  { label: "yes — run DB seed after setup", value: "yes" },
  { label: "no  — skip seeding",            value: "no"  },
];

function AddWorktree({
  preName,
  preNewBranch,
  preBase,
  onBack,
  onPhaseChange,
}: {
  preName?: string;
  preNewBranch?: boolean;
  preBase?: string;
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
}) {
  const initialPhase: AddPhase = preName ? "running" : "inputName";

  const [phase, setPhase] = useState<AddPhase>(initialPhase);
  const [name, setName] = useState(preName ?? "");
  const [isNew, setIsNew] = useState(preNewBranch ?? false);
  const [base, setBase] = useState(preBase ?? "main");
  const [dbName, setDbName] = useState("");
  const [seed, setSeed] = useState(false);
  const [envResult, setEnvResult] = useState<{ copied: string[]; skipped: string[]; errors: Array<{ file: string; error: string }> } | null>(null);
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: AddPhase) => {
    setPhase(p);
    const mapped =
      p === "running" || p === "copyingEnv" || p === "seeding"
        ? "running"
        : p === "done"
        ? "done"
        : "idle";
    onPhaseChange?.(mapped);
  };

  useInput((_input, key) => {
    if (key.escape && phase !== "running" && phase !== "copyingEnv" && phase !== "seeding") onBack?.();
  });

  // ── Phase: git worktree add ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "running") return;

    const run = async () => {
      callbacks.setStatus("running");
      callbacks.onLine(`Adding worktree for "${name}"…`);

      const args = worktreeAddArgs(name, { newBranch: isNew, base });
      callbacks.onLine(`$ git ${args.join(" ")}`);

      const result = await exec("git", args, {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });

      if (result.exitCode !== 0) {
        callbacks.setStatus("error");
        updatePhase("done");
        return;
      }

      updatePhase("copyingEnv");
    };

    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Phase: copy .env.local files ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== "copyingEnv") return;

    const run = async () => {
      callbacks.onLine("\nCopying .env.local files from main worktree…");

      const effectiveDb = dbName.trim() || name;
      const target = worktreePath(name);
      const res = await copyEnvFiles(target, effectiveDb);
      setEnvResult(res);

      for (const f of res.copied)  callbacks.onLine(`  ✔ copied  ${f}  (DB_DATABASE=${effectiveDb})`);
      for (const f of res.skipped) callbacks.onLine(`  ○ skipped ${f}  (not found in main worktree)`);
      for (const e of res.errors)  callbacks.onLine(`  ✘ error   ${e.file}: ${e.error}`);

      if (seed) {
        updatePhase("seeding");
      } else {
        callbacks.setStatus(res.errors.length === 0 ? "success" : "error");
        updatePhase("done");
      }
    };

    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Phase: seed ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "seeding") return;

    const run = async () => {
      callbacks.onLine("\nRunning DB seed…");
      callbacks.onLine(`$ pnpm --filter api run db:seed`);

      const result = await exec("pnpm", ["--filter", "api", "run", "db:seed"], {
        cwd: worktreePath(name),
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });

      callbacks.setStatus(result.exitCode === 0 ? "success" : "error");
      updatePhase("done");
    };

    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Input phases ──────────────────────────────────────────────────────────

  if (phase === "inputName") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Add worktree</Text>
        <Box gap={1}>
          <Text>Branch / worktree name:</Text>
          <TextInput
            value={name}
            onChange={setName}
            onSubmit={(val) => {
              if (val.trim()) {
                const trimmed = val.trim();
                setName(trimmed);
                setDbName(trimmed);
                updatePhase("inputMode");
              }
            }}
          />
        </Box>
      </Box>
    );
  }

  if (phase === "inputMode") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Add worktree — {name}</Text>
        <SelectInput
          items={MODE_ITEMS}
          onSelect={(item) => {
            const newBranch = item.value === "new";
            setIsNew(newBranch);
            if (newBranch) {
              updatePhase("inputBase");
            } else {
              updatePhase("inputDb");
            }
          }}
        />
      </Box>
    );
  }

  if (phase === "inputBase") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Add worktree — {name} (new branch)</Text>
        <Box gap={1}>
          <Text>Base branch:</Text>
          <TextInput
            value={base}
            onChange={setBase}
            onSubmit={(val) => {
              setBase(val.trim() || "main");
              updatePhase("inputDb");
            }}
          />
        </Box>
      </Box>
    );
  }

  if (phase === "inputDb") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Add worktree — {name}</Text>
        <Box gap={1}>
          <Text>DB name</Text>
          <Text dimColor>(leave blank to use <Text color="cyan">{name}</Text>):</Text>
          <TextInput
            value={dbName}
            onChange={setDbName}
            onSubmit={(val) => {
              setDbName(val.trim() || name);
              updatePhase("inputSeed");
            }}
          />
        </Box>
        <Text dimColor>Will set DB_DATABASE={dbName || name} in all copied .env.local files.</Text>
      </Box>
    );
  }

  if (phase === "inputSeed") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Add worktree — {name}</Text>
        <Text dimColor>Seed the database after setup?</Text>
        <SelectInput
          items={SEED_ITEMS}
          onSelect={(item) => {
            setSeed(item.value === "yes");
            updatePhase("running");
          }}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <ProcessOutput
        title={`git worktree add — ${name}`}
        status={output.status}
        completedLines={output.completedLines}
        liveLine={output.liveLine}
      />
      {phase === "done" && (
        <Box flexDirection="column" gap={1} marginTop={1}>
          {output.status === "success" && (
            <>
              <Text color="green">Worktree created at .worktrees/{name}</Text>
              {envResult && (
                <Text dimColor>
                  {envResult.copied.length} env file(s) copied
                  {envResult.skipped.length > 0 ? `, ${envResult.skipped.length} skipped` : ""}
                  {envResult.errors.length > 0 ? `, ${envResult.errors.length} error(s)` : ""}
                  .
                </Text>
              )}
            </>
          )}
          {output.status === "error" && (
            <Text color="red">Setup failed. See output above.</Text>
          )}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Remove
// ---------------------------------------------------------------------------

type RemovePhase = "selectWorktree" | "confirmForce" | "running" | "done";

const FORCE_ITEMS = [
  { label: "no  — normal remove",   value: "no"    },
  { label: "yes — force (discard uncommitted changes)", value: "yes" },
];

function RemoveWorktree({
  preName,
  preForce,
  onBack,
  onPhaseChange,
}: {
  preName?: string;
  preForce?: boolean;
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
}) {
  const initialPhase: RemovePhase = preName ? "running" : "selectWorktree";

  const [phase, setPhase] = useState<RemovePhase>(initialPhase);
  const [name, setName] = useState(preName ?? "");
  const [force, setForce] = useState(preForce ?? false);
  const [worktrees, setWorktrees] = useState<WorktreeInfo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: RemovePhase) => {
    setPhase(p);
    const mapped =
      p === "running" ? "running" : p === "done" ? "done" : "idle";
    onPhaseChange?.(mapped);
  };

  // Load worktrees for the picker (only needed in interactive mode)
  useEffect(() => {
    if (preName) return;
    listWorktrees()
      .then((wts) => setWorktrees(wts.filter((w) => !w.isMain)))
      .catch((e: unknown) => setLoadError(String(e)));
  }, []);

  useInput((_input, key) => {
    if (key.escape && phase !== "running") onBack?.();
  });

  useEffect(() => {
    if (phase !== "running") return;

    const run = async () => {
      callbacks.setStatus("running");
      const args = worktreeRemoveArgs(name, force);
      callbacks.onLine(`$ git ${args.join(" ")}`);

      const result = await exec("git", args, {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });

      callbacks.setStatus(result.exitCode === 0 ? "success" : "error");
      updatePhase("done");
    };

    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "selectWorktree") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Remove worktree</Text>

        {loadError && <Text color="red">{loadError}</Text>}

        {worktrees === null && !loadError && (
          <Text dimColor>Loading worktrees…</Text>
        )}

        {worktrees !== null && worktrees.length === 0 && (
          <Text dimColor>No non-main worktrees found.</Text>
        )}

        {worktrees !== null && worktrees.length > 0 && (
          <>
            <Text dimColor>Select a worktree to remove:</Text>
            <SelectInput
              items={worktrees.map((wt) => ({
                label: wt.branch,
                value: wt.branch,
              }))}
              onSelect={(item) => {
                setName(item.value);
                updatePhase("confirmForce");
              }}
              itemComponent={({ isSelected, label }) => {
                const wt = worktrees.find((w) => w.branch === label);
                return (
                  <Box gap={2}>
                    <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
                      {label}
                    </Text>
                    {wt && <Text dimColor>{wt.path}</Text>}
                  </Box>
                );
              }}
            />
          </>
        )}
      </Box>
    );
  }

  if (phase === "confirmForce") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Remove worktree — {name}</Text>
        <Text dimColor>Force-remove (discard uncommitted changes)?</Text>
        <SelectInput
          items={FORCE_ITEMS}
          onSelect={(item) => {
            setForce(item.value === "yes");
            updatePhase("running");
          }}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <ProcessOutput
        title={`git worktree remove — ${name}`}
        status={output.status}
        completedLines={output.completedLines}
        liveLine={output.liveLine}
      />
      {phase === "done" && (
        <Box flexDirection="column" gap={1} marginTop={1}>
          {output.status === "success" && (
            <Text color="green">Worktree .worktrees/{name} removed.</Text>
          )}
          {output.status === "error" && (
            <Text color="red">
              Failed to remove worktree. If it has uncommitted changes, use force remove.
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Prune
// ---------------------------------------------------------------------------

function PruneWorktrees({ onBack, onPhaseChange }: { onBack?: () => void; onPhaseChange?: (phase: "idle" | "running" | "done") => void }) {
  const [phase, setPhase] = useState<Phase>("running");
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: Phase) => {
    setPhase(p);
    onPhaseChange?.(p === "input" ? "idle" : p === "running" ? "running" : "done");
  };

  useInput((_input, key) => {
    if (key.escape && phase !== "running") onBack?.();
  });

  useEffect(() => {
    if (phase !== "running") return;

    const run = async () => {
      callbacks.setStatus("running");
      callbacks.onLine(`$ git ${WORKTREE_PRUNE_ARGS.join(" ")}`);

      const result = await exec("git", [...WORKTREE_PRUNE_ARGS], {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });

      callbacks.setStatus(result.exitCode === 0 ? "success" : "error");
      updatePhase("done");
    };

    void run();
  }, []);

  return (
    <Box flexDirection="column" gap={1}>
      <ProcessOutput
        title="git worktree prune"
        status={output.status}
        completedLines={output.completedLines}
        liveLine={output.liveLine}
      />
      {phase === "done" && (
        <Box flexDirection="column" gap={1} marginTop={1}>
          {output.status === "success" && (
            <Text color="green">Stale worktree metadata pruned.</Text>
          )}
          {output.status === "error" && (
            <Text color="red">Prune failed. See output above.</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
