import { ChatConversationEntity } from "@liexp/backend/lib/entities/ChatConversation.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type AgentType, type ChatMessage } from "@liexp/io/lib/http/Chat.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal, IsNull } from "typeorm";
import { type AgentContext } from "../../context/context.type.js";

/**
 * Postgres-backed chat conversation store (table `chat_conversation`).
 *
 * Conversations are owned by the authenticated user (JWT user id); every read
 * and write is scoped by it so admins never see each other's history.
 */

const TITLE_MAX_LENGTH = 80;

// `id` is a uuid column: a malformed id would make Postgres throw instead of
// simply not matching anything.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isConversationId = (id: string): boolean => UUID_RE.test(id);

const ownerWhere = (userId: string | null) =>
  userId ? { userId: Equal(userId as UUID) } : { userId: IsNull() };

const makeTitle = (messages: ChatMessage[]): string => {
  const first = messages.find((m) => m.role === "user")?.content ?? "";
  const oneLine = first.replace(/\s+/g, " ").trim();
  return oneLine.length > TITLE_MAX_LENGTH
    ? `${oneLine.slice(0, TITLE_MAX_LENGTH - 1)}…`
    : oneLine;
};

export interface StoredConversation {
  id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

const toStored = (e: ChatConversationEntity): StoredConversation => ({
  id: e.id,
  messages: e.messages,
  created_at: new Date(e.createdAt).toISOString(),
  updated_at: new Date(e.updatedAt).toISOString(),
});

export const getConversation =
  (userId: string | null, conversationId: string) =>
  (ctx: AgentContext): TE.TaskEither<Error, O.Option<StoredConversation>> =>
    !isConversationId(conversationId)
      ? TE.right(O.none)
      : pipe(
          ctx.db.findOne(ChatConversationEntity, {
            where: { id: Equal(conversationId as UUID), ...ownerWhere(userId) },
          }),
          TE.map(O.map(toStored)),
          TE.mapLeft((e): Error => e),
        );

export const listConversations =
  (userId: string | null, query: { limit?: number; offset?: number }) =>
  (
    ctx: AgentContext,
  ): TE.TaskEither<Error, { total: number; data: StoredConversation[] }> =>
    pipe(
      ctx.db.findAndCount(ChatConversationEntity, {
        where: ownerWhere(userId),
        order: { updatedAt: "DESC" },
        ...(query.limit !== undefined ? { take: query.limit } : {}),
        ...(query.offset !== undefined ? { skip: query.offset } : {}),
      }),
      TE.map(([rows, total]) => ({ total, data: rows.map(toStored) })),
      TE.mapLeft((e): Error => e),
    );

export const deleteConversation =
  (userId: string | null, conversationId: string) =>
  (ctx: AgentContext): TE.TaskEither<Error, boolean> =>
    !isConversationId(conversationId)
      ? TE.right(false)
      : pipe(
          ctx.db.softDelete(ChatConversationEntity, {
            id: Equal(conversationId as UUID),
            ...ownerWhere(userId),
          }),
          TE.map((r) => (r.affected ?? 0) > 0),
          TE.mapLeft((e): Error => e),
        );

/** Append a user/assistant exchange, creating the conversation on first turn. */
export const appendTurn =
  (
    userId: string | null,
    turn: {
      conversationId: string;
      agentType?: AgentType;
      messages: ChatMessage[];
    },
  ) =>
  (ctx: AgentContext): TE.TaskEither<Error, void> =>
    pipe(
      ctx.db.findOne(ChatConversationEntity, {
        where: {
          id: Equal(turn.conversationId as UUID),
          ...ownerWhere(userId),
        },
      }),
      TE.chain((existing) => {
        const previous = pipe(
          existing,
          O.map((e) => e.messages),
          O.getOrElse((): ChatMessage[] => []),
        );
        const messages = [...previous, ...turn.messages];
        return ctx.db.save(ChatConversationEntity, [
          {
            id: turn.conversationId as UUID,
            userId,
            agentType: turn.agentType ?? null,
            title: makeTitle(messages),
            messages,
          },
        ]);
      }),
      TE.map(() => undefined),
      TE.mapLeft((e): Error => e),
    );
