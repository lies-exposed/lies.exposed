import { type AgentType, type ChatMessage } from "@liexp/io/lib/http/Chat.js";
import { type UUID } from "@liexp/io/lib/http/Common/index.js";
import { Column, Entity, Index } from "typeorm";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const CHAT_CONVERSATION_ENTITY_NAME = "chat_conversation";

/**
 * Persisted AI chat conversation (admin chat).
 *
 * `id` is the conversation id handed out by the agent (client-supplied on
 * first message), `messages` holds the visible exchange as `ChatMessage[]`.
 */
@Entity(CHAT_CONVERSATION_ENTITY_NAME)
export class ChatConversationEntity extends DeletableEntity {
  /** Owner of the conversation (JWT user id). */
  @Index()
  @Column({ type: "uuid", nullable: true })
  userId: UUID | null;

  @Column({ type: "varchar", default: "" })
  title: string;

  @Column({ type: "varchar", nullable: true })
  agentType: AgentType | null;

  @Column({ type: "jsonb", default: () => "'[]'" })
  messages: ChatMessage[];
}
