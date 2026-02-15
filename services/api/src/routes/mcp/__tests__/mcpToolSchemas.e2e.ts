import { BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
// actors
import { CreateActorInputSchema } from "../tools/actors/createActor.tool.js";
import { EditActorInputSchema } from "../tools/actors/editActor.tool.js";
import { FindActorsInputSchema } from "../tools/actors/findActors.tool.js";
import { GetActorInputSchema } from "../tools/actors/getActor.tool.js";
// areas
import { CreateAreaInputSchema } from "../tools/areas/createArea.tool.js";
import { EditAreaInputSchema } from "../tools/areas/editArea.tool.js";
import { FindAreasInputSchema } from "../tools/areas/findAreas.tool.js";
import { GetAreaInputSchema } from "../tools/areas/getArea.tool.js";
// events
import { CreateUnifiedEventInputSchema } from "../tools/events/createUnifiedEvent.tool.js";
import { EditEventInputSchema } from "../tools/events/editEvent.tool.js";
import { FindEventsInputSchema } from "../tools/events/findEvents.tool.js";
import { GetEventInputSchema } from "../tools/events/getEvent.tool.js";
// groups
import { CreateInputSchema as CreateGroupInputSchema } from "../tools/groups/createGroup.tool.js";
import { EditInputSchema as EditGroupInputSchema } from "../tools/groups/editGroup.tool.js";
import { FindGroupsInputSchema } from "../tools/groups/findGroups.tool.js";
import { GetGroupInputSchema } from "../tools/groups/getGroup.tool.js";
import { registerTools } from "../tools/index.js";
// links
import { CreateLinkInputSchema } from "../tools/links/createLink.tool.js";
import { EditLinkInputSchema } from "../tools/links/editLink.tool.js";
import { FindLinksInputSchema } from "../tools/links/findLinks.tool.js";
import { GetLinkInputSchema } from "../tools/links/getLink.tool.js";
// media
import { CreateMediaInputSchema } from "../tools/media/createMedia.tool.js";
import { EditMediaInputSchema } from "../tools/media/editMedia.tool.js";
import { FindMediaInputSchema } from "../tools/media/findMedia.tool.js";
import { GetMediaInputSchema } from "../tools/media/getMedia.tool.js";
// nations
import { FindNationsInputSchema } from "../tools/nations/findNations.tool.js";
import { GetNationInputSchema } from "../tools/nations/getNation.tool.js";

const allSchemas: [string, Schema.Struct<any>][] = [
  // actors
  ["CreateActor", CreateActorInputSchema],
  ["EditActor", EditActorInputSchema],
  ["FindActors", FindActorsInputSchema],
  ["GetActor", GetActorInputSchema],
  // areas
  ["CreateArea", CreateAreaInputSchema],
  ["EditArea", EditAreaInputSchema],
  ["FindAreas", FindAreasInputSchema],
  ["GetArea", GetAreaInputSchema],
  // events
  ["CreateUnifiedEvent", CreateUnifiedEventInputSchema],
  ["EditEvent", EditEventInputSchema],
  ["FindEvents", FindEventsInputSchema],
  ["GetEvent", GetEventInputSchema],
  // groups
  ["CreateGroup", CreateGroupInputSchema],
  ["EditGroup", EditGroupInputSchema],
  ["FindGroups", FindGroupsInputSchema],
  ["GetGroup", GetGroupInputSchema],
  // links
  ["CreateLink", CreateLinkInputSchema],
  ["EditLink", EditLinkInputSchema],
  ["FindLinks", FindLinksInputSchema],
  ["GetLink", GetLinkInputSchema],
  // media
  ["CreateMedia", CreateMediaInputSchema],
  ["EditMedia", EditMediaInputSchema],
  ["FindMedia", FindMediaInputSchema],
  ["GetMedia", GetMediaInputSchema],
  // nations
  ["FindNations", FindNationsInputSchema],
  ["GetNation", GetNationInputSchema],
];

describe("MCP Tool Schema Registration", () => {
  describe("effectToZodStruct conversion", () => {
    test.each(allSchemas)(
      "%s schema converts to Zod without errors",
      (name, schema) => {
        const zodSchema = effectToZodStruct(schema);
        expect(zodSchema).toBeDefined();
        expect(typeof zodSchema).toBe("object");
        // Verify each field converted to a Zod type
        for (const [_key, value] of Object.entries(zodSchema)) {
          expect(value).toBeDefined();
          expect(typeof (value as any).parse).toBe("function");
        }
      },
    );

    test("BlockNoteDocument inline schema converts to Zod without errors", () => {
      const zodSchema = effectToZodStruct(
        Schema.Struct({
          blocknote: BlockNoteDocument.annotations({
            description: "BlockNote JSON document",
          }),
        }),
      );
      expect(zodSchema).toBeDefined();
      expect(typeof zodSchema).toBe("object");
    });
  });

  describe("registerTools integration", () => {
    let Test: AppTest;

    beforeAll(async () => {
      Test = await GetAppTest();
    });

    test("registerTools registers all tools on McpServer without errors", () => {
      const server = new McpServer({
        name: "test-mcp-server",
        version: "0.0.1",
      });

      expect(() => registerTools(server, Test.ctx)).not.toThrow();
    });
  });
});
