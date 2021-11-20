import { fc } from "@econnessione/core/tests";
import { Actor } from "../io/http";
import { ActorArb } from "../tests/arbitrary/GroupMember.arbitrary";

export const [goodActor, goodSecondActor, badActor, badSecondActor] = fc.sample(
  ActorArb,
  4
);

export const actors: Actor.Actor[] = [goodActor, badActor, badSecondActor];
