## Summary

Replace `any` casts with properly typed assertions in @liexp/shared production code and test files.

## Changes

### Production files (3 any casts removed)
- **helpers/event-suggestion.ts**: Removed `as unknown as` wrapper from branded URL cast
- **helpers/event/merge-event.helper.ts**: Removed `as unknown as` wrapper from `Event["payload"]` cast
- **providers/blocknote/getTextContents.ts**: Defined `BNContentItem` and `BNTextBlock` interfaces (uses `as unknown as` for BlockNote type overlap)
- **providers/blocknote/utils.ts**: Simplified `BlockNoteDocument` cast (uses `as unknown as` for Brand overlap)
- **utils/schema.utils.ts**: Defined `PropertySignatureDeclaration` interface (uses `as unknown as` for AST overlap)

### Test files (all use proper types now)
- **providers/blocknote/blocknote.providers.spec.ts**: Use `BNEditorDocument` type from `./type.js`
- **providers/http/http.provider.spec.ts**: Use `axiosModule.AxiosError` type
- **providers/pdf/pdf.provider.spec.ts**: Import `PDFDocumentProxy` and `PDFProviderContext` types
- **utils/__tests__/APIError.utils.spec.ts**: Import `IOError` and `IOErrorDetails` types
- **utils/__tests__/schema.utils.spec.ts**: Use `Record<string, z.ZodType>` instead of `any`
- **helpers/__tests__/social-post.spec.ts**: Use `SocialPost` type
- **Test files**: Replace `as any` with `as unknown as <Type>` throughout

## Verification

```
pnpm --filter @liexp/shared build  → ✓ passed
pnpm --filter @liexp/shared lint  → ✓ passed
pnpm --filter @liexp/shared test  → ✓ passed
```

## Acceptance
- [x] shared prod any casts 3 -> 0 (production code)
- [x] `pnpm --filter @liexp/shared lint` passes
- [x] `pnpm --filter @liexp/shared test` passes
