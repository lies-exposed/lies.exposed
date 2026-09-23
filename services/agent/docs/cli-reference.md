# liexp_cli Command Reference

All commands output JSON to stdout on success.

When a command fails, the tool returns a string starting with `ERROR (exit 1):` followed by the error description. **Do not ignore this.** When you see an error:
- **Report it to the user** — explain what went wrong in plain language
- **Do not retry the same failing command** with the same arguments
- Only retry if you can fix the root cause (e.g. wrong flag, missing required argument, invalid UUID)
- If the error is unrecoverable (e.g. server error, permission denied), stop and tell the user

## Actor commands

| Subcommand | Key flags |
|------------|-----------|
| `actor list` | `--fullName=<name>`, `--memberIn=<uuid>`, `--sort=createdAt\|fullName\|username`, `--order=ASC\|DESC`, `--start=N`, `--end=N` |
| `actor get` | `--id=<uuid>` |
| `actor create` | `--username=<slug>` (req), `--fullName=<name>` (req), `--excerpt`, `--body`, `--avatar=<uuid>`, `--nationalities=<nation-uuid,...>`, `--bornOn=YYYY-MM-DD`, `--diedOn=YYYY-MM-DD`, `--color=<hex>` |
| `actor edit` | `--id=<uuid>` (req), `--username`, `--fullName`, `--excerpt`, `--body`, `--avatar=<uuid>`, `--nationalities`, `--bornOn`, `--diedOn`, `--memberIn=<group-uuid,...>` |
| `actor find-avatar` | `--fullName=<name>` (req) — searches Wikipedia, downloads image, saves as Media, prints media UUID |

## Group commands

| Subcommand | Key flags |
|------------|-----------|
| `group list` | `--query=<name>`, `--sort=createdAt\|name`, `--order=ASC\|DESC`, `--start=N`, `--end=N` |
| `group get` | `--id=<uuid>` |
| `group create` | `--name=<name>` (req), `--username=<slug>` (req), `--kind=Public\|Private` (req), `--excerpt`, `--avatar=<uuid>`, `--startDate=YYYY-MM-DD`, `--endDate=YYYY-MM-DD`, `--color=<hex>` |
| `group edit` | `--id=<uuid>` (req), `--name`, `--kind`, `--excerpt`, `--avatar=<uuid>`, `--members=<actor-uuid>` |
| `group find-avatar` | `--name=<name>` (req) — searches Wikipedia, downloads image, saves as Media, prints media UUID |

## Event commands

Create/edit are **per type**: `event <type> create` / `event <type> edit --id=<uuid>`, where `<type>` is one of `uncategorized`, `death`, `quote`, `transaction`, `scientific-study`, `book`, `patent`, `documentary`. Run `event <type> create --help` for the exact flags.

| Subcommand | Key flags |
|------------|-----------|
| `event list` | `--query=<text>`, `--actors=<uuid>`, `--groups=<uuid>`, `--type=<Death\|Quote\|Transaction\|ScientificStudy\|Book\|Patent\|Documentary\|Uncategorized>`, `--startDate=YYYY-MM-DD`, `--endDate=YYYY-MM-DD`, `--start=N`, `--end=N` |
| `event get` | `--id=<uuid>` |

Common flags for every `event <type> create`: `--date=YYYY-MM-DD` (req), `--draft=true\|false`, `--excerpt=<plain text>`, `--links=uuid,...`, `--media=uuid,...`, `--keywords=uuid,...`. Type-specific:

| Type | Required | Optional |
|------|----------|----------|
| `uncategorized` | `--title` | `--actors`, `--groups`, `--groupsMembers`, `--location=<area-uuid>`, `--endDate` |
| `death` | `--victim=<actor-uuid>` | `--location=<area-uuid>` |
| `quote` | — | `--actor=<actor-uuid>`, `--quote=<text>`, `--details` |
| `transaction` | `--title`, `--total`, `--currency`, `--fromType=Actor\|Group`, `--fromId`, `--toType=Actor\|Group`, `--toId` | — |
| `scientific-study` | `--title`, `--studyUrl=<link-uuid>` (run `link create --url=...` first) | `--image=<media-uuid>`, `--publisher=<actor-uuid>`, `--authors=<actor-uuid,...>` |
| `book` | `--title`, `--pdf=<media-uuid>` | `--audio=<media-uuid>`, `--authors`, `--publisher` |
| `patent` | `--title` | `--ownerActors`, `--ownerGroups`, `--source=<link-uuid>` |
| `documentary` | `--title`, `--documentaryMedia=<media-uuid>` | `--website=<link-uuid>`, `--authorActors`, `--authorGroups`, `--subjectActors`, `--subjectGroups` |

`event <type> edit --id=<uuid>` takes the same flags, all optional. Array flags replace the current list.

## Link commands

| Subcommand | Key flags |
|------------|-----------|
| `link list` | `--query=<text>`, `--sort=createdAt\|title\|url`, `--order=ASC\|DESC`, `--start=N`, `--end=N` |
| `link get` | `--id=<uuid>` |
| `link create` | `--url=<url>` (req) — auto-fetches metadata via OpenGraph |
| `link edit` | `--id=<uuid>` (req), `--title`, `--description`, `--url`, `--status=DRAFT\|APPROVED\|UNAPPROVED`, `--publishDate=YYYY-MM-DD`, `--events=uuid,...`, `--keywords=uuid,...` |

## Media commands

| Subcommand | Key flags |
|------------|-----------|
| `media list` | `--query=<text>`, `--sort=createdAt\|label`, `--order=ASC\|DESC`, `--start=N`, `--end=N` |
| `media get` | `--id=<uuid>` |
| `media create` | `--location=<url>` (req), `--type=<mime>` (req), `--label`, `--description`, `--thumbnail=<url>`, `--events=uuid,...`, `--links=uuid,...`, `--keywords=uuid,...`, `--areas=uuid,...` |
| `media edit` | `--id=<uuid>` (req), `--location=<url>` (req), `--type=<mime>` (req), `--label` (req), `--description`, `--thumbnail=<url>`, `--events=uuid,...`, `--links=uuid,...`, `--keywords=uuid,...`, `--areas=uuid,...` |

## Story commands

| Subcommand | Key flags |
|------------|-----------|
| `story list` | `--query=<text>`, `--draft=true\|false`, `--creator=<uuid>`, `--start=N`, `--end=N` |
| `story get` | `--id=<uuid>` |
| `story create` | `--title` (req), `--path=<slug>` (req), `--date=YYYY-MM-DD` (req), `--draft` (default true), `--creator=<actor-uuid>`, `--featuredImage=<media-uuid>`, `--keywords`, `--actors`, `--groups`, `--events`, `--media` |
| `story edit` | `--id=<uuid>` (req), same flags as create plus `--body=<plain text>`, `--links` |

## Area commands

| Subcommand | Key flags |
|------------|-----------|
| `area list` | `--query=<label>`, `--sort=createdAt\|label`, `--order=ASC\|DESC`, `--start=N`, `--end=N` |
| `area get` | `--id=<uuid>` |
| `area create` | `--label=<string>` (req), `--slug=<string>` (req), `--draft=true\|false`, `--geometry=<geojson>` |
| `area edit` | `--id=<uuid>` (req), `--label`, `--slug`, `--draft=true\|false`, `--geometry=<geojson>`, `--featuredImage=<uuid>`, `--media=uuid,...`, `--events=uuid,...` |

## Nation commands

| Subcommand | Key flags |
|------------|-----------|
| `nation list` | `--name=<text>`, `--start=N`, `--end=N` |
| `nation get` | `--id=<uuid>` |

## Examples

```
# Find the 5 most recently created actors
liexp_cli("actor list --sort=createdAt --order=DESC --start=0 --end=5")

# Find groups matching a query
liexp_cli("group list --query=Party --end=10")

# Get a specific group
liexp_cli("group get --id=550e8400-e29b-41d4-a716-446655440000")

# Search events about vaccines
liexp_cli("event list --query=vaccine --end=10")

# Find events for a specific actor
liexp_cli("event list --actors=550e8400-e29b-41d4-a716-446655440000 --end=20")

# Save a link from a URL
liexp_cli("link create --url=https://example.com/article")

# Create a Death event
liexp_cli("event death create --date=2024-03-15 --victim=<actor-uuid> --links=<link-uuid>")

# Edit a link's status and title
liexp_cli("link edit --id=<uuid> --title=Updated Title --status=APPROVED")

# Upload a media entry
liexp_cli("media create --location=https://example.com/image.jpg --type=image/jpeg --label=My Image")

# Find an actor avatar on Wikipedia
liexp_cli("actor find-avatar --fullName=Elon Musk")

# Find a group avatar on Wikipedia
liexp_cli("group find-avatar --name=Greenpeace")

# Create a new geographic area
liexp_cli("area create --label=Kyiv Oblast --slug=kyiv-oblast")
```
