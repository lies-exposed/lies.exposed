---
title: Telegram Bot Message Handler Flow Analysis
type: note
permalink: telegram/telegram-bot-message-handler-flow-analysis
---

# Telegram Bot Message Handler Flow Analysis

## Overview
Analyzed the Telegram bot/worker service to identify how it handles incoming messages with links and replies. Found critical issue where error handling may prevent replies from being sent in certain cases.

## Key Architecture

### Entry Point: Message Handler
**File**: `services/worker/src/providers/tg/index.ts`

The `TGMessageCommands` function sets up the Telegram message listener:
```typescript
ctx.tg.onMessage((msg, metadata) => {
  if (msg.text?.startsWith("/")) {
    ctx.logger.debug.log("Command message %s, skipping...", msg.text);
    return;
  }

  void pipe(
    sequenceS(fp.TE.ApplicativePar)({
      storeMsg: ctx.fs.writeObject(...),
      eventSuggestion: createFromTGMessage(msg, metadata)({ ...ctx, logger: tgLogger }),
    }),
    fp.TE.map(({ eventSuggestion }) => {
      tgLogger.info.log("Success %O", eventSuggestion);
      return getThanksMessage(eventSuggestion, ctx.env.WEB_URL);
    }),
    throwTE,
  )
    .then((message) =>
      ctx.tg.api.sendMessage(msg.chat.id, message, {
        reply_to_message_id: msg.message_id,
      }),
    )
    .catch((e) => {
      tgLogger.error.log("Error %O", e);
    });
});
```

### Message Processing Pipeline
**File**: `packages/@liexp/backend/src/flows/tg/createFromTGMessage.flow.ts`

Processing steps:
1. Get admin user (creator)
2. Open Puppeteer browser page
3. In parallel parse:
   - URLs from text/text_links
   - Photos 
   - Videos
   - Documents
   - Platform media (YouTube, Rumble, etc.)
4. Extract hashtags
5. Return `EventResult` with collected IDs

### Link Processing
**File**: `packages/@liexp/backend/src/flows/tg/parseURL.flow.ts`

For each URL:
1. Check if link already exists in DB
2. If not, create new link via `fromURL()`
3. Take screenshot via `takeLinkScreenshot()`
4. Queue for OpenAI embedding
5. Save to DB

### Telegram API Interface
**File**: `packages/@liexp/backend/src/providers/tg/tg.provider.ts`

- `onMessage()`: Registers event handler
- `post()`: Sends text reply
- Uses `node-telegram-bot-api` library with polling

## Critical Issues Found

### Issue 1: Silent Error Swallowing (Blocking)
**Location**: `services/worker/src/providers/tg/index.ts:38-65`

The promise chain uses `.catch((e) => { tgLogger.error.log(...) })` which only logs the error but never sends a reply to the user.

**Flow**:
1. `void pipe(..., throwTE)` - converts TaskEither to Promise
2. `.then(...)` - sends reply to Telegram
3. `.catch(...)` - catches ALL errors, logs them, but **does NOT send reply**

**Problem**: If ANY step in `createFromTGMessage` fails (URL parsing, screenshot taking, DB operations), the promise rejects, error is logged, but user gets NO feedback.

### Issue 2: No Error Reply to User
Unlike successful messages which get a "Thanks for your contribution!" reply, failed messages get:
- Server logs the error
- **No message sent to Telegram user**
- User is left wondering if their input was processed

### Issue 3: Specific Error Conditions
These conditions would cause silent failure:

**Link Processing Errors**:
- URL fails validation in `parseURL.flow.ts:55-60`
- Screenshot capture fails in `takeLinkScreenshot.flow.ts`
- DB save fails in `LinkRepository.save()`
- OpenAI queue operation fails

**Media Processing Errors**:
- Photo download fails via `tg.getFileStream()`
- Image processing fails via imgProc
- S3 upload fails
- FFmpeg conversion fails

**Database Errors**:
- Admin user lookup fails in `getOneAdminOrFail()`
- Link exists check fails

**Browser Errors**:
- Puppeteer browser open fails
- Page operations fail (in URL parsing)
- Browser close fails

All of these would result in a rejected promise → caught error → silent user failure.

### Issue 4: Message Parser Link Extraction
**Location**: `packages/@liexp/backend/src/flows/tg/MessageParser/index.ts:71-83`

Two URL sources:
1. `message.entities` - URLs explicitly marked as type "url" or "text_link"
2. `message.caption_entities` - URLs in caption

Filtering happens at line 98:
- Excluded URLs are filtered out (line 98)
- Invalid URL strings are filtered out (line 55-60 in parseURL.flow.ts)

If all URLs filtered/excluded, user still gets no error feedback.

### Issue 5: Timing/Race Condition Risk
The message handler uses `void` prefix on the async operation:
```typescript
void pipe(...) // Fire and forget
  .then(...)
  .catch(...)
```

This means:
- No guarantee handler completes before next message
- No guarantee reply is sent before connection closes
- No visibility into which operations completed

## Data Flow for Links

1. **Extract**: URLs from `message.entities` + `caption_entities`
2. **Filter**: Remove excluded URLs
3. **Validate**: Schema validation
4. **Lookup**: Check if link exists in DB
5. **Create**: If new:
   - Create LinkEntity via `fromURL()`
   - Take screenshot
   - Queue for embedding
   - Save to DB
6. **Reply**: Send "Thanks" message with links: `{WEB_URL}/links/{id}`

If step 3-5 fails → error logged → no reply sent

## Files Summary

| File | Purpose | Key Function |
|------|---------|--------------|
| `services/worker/src/providers/tg/index.ts` | Main handler | TGMessageCommands() |
| `services/worker/src/utils/tg.utils.ts` | Message formatting | getThanksMessage() |
| `services/worker/src/context/context.ts` | Context types | WorkerContext |
| `packages/@liexp/backend/src/flows/tg/createFromTGMessage.flow.ts` | Main processing | createFromTGMessage() |
| `packages/@liexp/backend/src/flows/tg/MessageParser/index.ts` | URL/media extraction | MessageParser() |
| `packages/@liexp/backend/src/flows/tg/parseURL.flow.ts` | Link creation | parseURLs() |
| `packages/@liexp/backend/src/providers/tg/tg.provider.ts` | Telegram API | TGBotProvider |

## Why Replies Don't Always Get Sent

**Root Cause**: Error handling in the main message handler (index.ts:32-66) catches errors but never sends a failure message to the user.

**Execution Model**:
```
User sends message
    ↓
onMessage handler called
    ↓
createFromTGMessage() called (can fail at many points)
    ↓
    If SUCCESS: Generate thanks message → Send reply ✓
    If FAILURE: Log error → .catch() catches it → No reply sent ✗
```

**Why not caught earlier**: 
- Uses `throwTE` (converts TaskEither to rejecting Promise)
- Error handling is only at Promise level (.catch)
- No fallback error message for users
