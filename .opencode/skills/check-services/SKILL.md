---
name: check-services
description: Health-check lies.exposed services on the production Kubernetes cluster. Detects CrashLoopBackOff, high restart counts, ERROR log patterns, and queue backlogs. Trigger keywords: check services, service health, pod health, is api running, queue backlog, worker stuck, agent down.
---

# check-services Skill

Diagnose lies.exposed services on the production Kubernetes cluster.

## Variables

```
NAMESPACE=liexp
SERVICES=api,agent,worker,ai-bot,web,admin
LOG_TAIL=300
```

## Step 1 — Pod status overview

```bash
kubectl -n liexp get pods -o custom-columns="NAME:.metadata.name,STATUS:.status.phase,READY:.status.containerStatuses[0].ready,RESTARTS:.status.containerStatuses[0].restartCount,AGE:.metadata.creationTimestamp"
```

Flag if:
- STATUS != `Running`
- READY = `false`
- RESTARTS > 3

Describe flagged pods:
```bash
kubectl -n liexp describe pod <name> | grep -A5 -E "State:|Last State:|Events:|Reason:|Exit Code:"
```

## Step 2 — Error logs for flagged services

```bash
kubectl -n liexp logs -l app=<service> --tail=300 --since=15m 2>&1
```

Scan for: `ERROR`, `error`, `exception`, `FATAL`, `unhandled`, stack traces.

## Step 3 — Queue backlog check (api service)

```bash
kubectl -n liexp port-forward svc/api 3010:3010 &
curl -s 'http://localhost:3010/v1/queues?status=pending' | jq '.total'
```

Flag if pending queue count > 50 (possible ai-bot jam).

## Step 4 — Synthesize & report

```
╔══════════════════════════════════════╗
║    lies.exposed service health       ║
╚══════════════════════════════════════╝

Service     Status    Ready  Restarts
──────────────────────────────────────
api         Running   true   0        [OK]
agent       Running   true   0        [OK]
worker      ...
ai-bot      ...
web         ...
admin       ...

── Errors in last 15m ────────────────
<none | list with timestamps>

── Queue backlog ──────────────────────
Pending jobs: N  [OK if <50 | ⚠ if ≥50]

══════════════════════════════════════
Overall: [HEALTHY | DEGRADED | CRASHED]
```

## Step 5 — Suggest action (if not HEALTHY)

| Overall | Suggested action |
|---------|-----------------|
| DEGRADED | Show error lines. Ask user if they want full logs. |
| CRASHED | Show last state + events. Ask before restarting. |

Do NOT restart automatically. Always confirm with user first.

## Kubeconfig note

Use default kubeconfig. Production namespace is `liexp`.
