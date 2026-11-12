## Summary

Reduce `any` casts in @liexp/backend production code by using proper type casts (`as unknown as T`) where needed, and removing unused eslint-disable directives.

## Changes

### Type fixes (actual any removal/improvement)
- **buildActorRelationTree.flow.ts**: Use `as unknown as` for actor relation arrays instead of bare `as any[]`
- **buildImageWithSharp.flow.ts**: Use `as unknown as` for sharp metadata; add eslint-disable for legitimate `Record<string, any>` type param
- **readExifMetadataFromImage.flow.ts**: Use `as unknown as` for buffer-to-File cast
- **extractThumbnailFromPDF.flow.ts**: Use `as unknown as` for PDF metadata extraction
- **MessageParser/index.ts**: Use `as unknown as` for URL string casts from telegram message entities
- **media.io.ts**: Use `as unknown as` for media output mappers
- **puppeteer.provider.ts**: Use `as unknown as` for puppeteer interactions
- **tg.provider.ts**: Use `as unknown as` for telegram provider casts
- **editEvent.query.ts**: Use `as unknown as` for event query types
- **agent-chat.service.ts**: Add eslint-disable for legitimate `Schema.Schema<T, any, never>` type params

### Cleanup (unused eslint-disable removal)
- **puppeteer.load.ts**: Removed unused eslint-disable (cast uses `unknown`, not `any`)
- **ssr-handler.ts**: Removed unused eslint-disable
- **readExifMetadataFromImage.flow.ts**: Removed unused eslint-disable
- **MessageParser/index.ts**: Removed 2 unused eslint-disables
- **langchain.provider.ts**: Removed unused eslint-disable
- **puppeteer.provider.ts**: Removed unused eslint-disable
- **buildImageWithSharp.flow.ts**: Removed unused eslint-disable
- **agent-chat.service.ts**: Removed unused eslint-disable

## Verification

```
pnpm --filter @liexp/backend lint  → 0 errors, 79 warnings (all in non-our files)
pnpm --filter @liexp/backend test  → 121 test files, 1111 tests, all passed
```

## Diff vs origin/main

```
14 files changed, 33 insertions(+), 23 deletions(-)
```
