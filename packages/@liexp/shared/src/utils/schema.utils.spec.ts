import { Schema } from "effect";
import { describe, expect, test } from "vitest";
import type { z } from "zod";
import { BlockNoteDocument } from "../io/http/Common/BlockNoteDocument.js";
import { effectToZod, effectToZodStruct } from "./schema.utils.js";

describe("effectToZod", () => {
  describe("Basic Types", () => {
    test("should convert string schema", () => {
      const schema = Schema.String;
      const zodSchema = effectToZod(schema);

      expect(zodSchema.safeParse("test").success).toBe(true);
      expect(zodSchema.safeParse(123).success).toBe(false);
    });

    test("should convert number schema", () => {
      const schema = Schema.Number;
      const zodSchema = effectToZod(schema);
      expect(zodSchema.safeParse(123).success).toBe(true);
      expect(zodSchema.safeParse("test").success).toBe(false);
    });

    test("should convert boolean schema", () => {
      const schema = Schema.Boolean;
      const zodSchema = effectToZod(schema);
      expect(zodSchema.safeParse(true).success).toBe(true);
      expect(zodSchema.safeParse("true").success).toBe(false);
    });

    test("should convert undefined schema", () => {
      const schema = Schema.Undefined.annotations({
        jsonSchema: { type: "null" },
      });
      const zodSchema = effectToZod(schema);
      expect(zodSchema.safeParse(null).success).toBe(false);
      expect(zodSchema.safeParse(undefined).success).toBe(true);
    });
  });

  describe("Optional Types", () => {
    test("should convert nullable string schema", () => {
      const schema = Schema.NullOr(Schema.String);
      const zodSchema = effectToZod(schema);

      expect(zodSchema.safeParse("test").success).toBe(true);
      expect(zodSchema.safeParse(null).success).toBe(true);
      expect(zodSchema.safeParse(undefined).success).toBe(false);
    });

    test("should convert nullable number schema", () => {
      const schema = Schema.NullOr(Schema.Number);
      const zodSchema = effectToZod(schema);

      expect(zodSchema.safeParse(123).success).toBe(true);
      expect(zodSchema.safeParse(null).success).toBe(true);
      expect(zodSchema.safeParse("123").success).toBe(false);
    });
  });

  describe("Array Types", () => {
    test("should convert array of strings schema", () => {
      const schema = Schema.Array(Schema.String);
      const zodSchema = effectToZod(schema);

      expect(zodSchema.safeParse(["test", "test2"]).success).toBe(true);
      expect(zodSchema.safeParse([123, "test"]).success).toBe(false);
      expect(zodSchema.safeParse("not an array").success).toBe(false);
    });

    test("should convert array of optional numbers schema", () => {
      const schema = Schema.Array(
        Schema.NullOr(Schema.Number).annotations({
          description: "An optional number",
        }),
      );
      const zodSchema = schema.pipe(effectToZod);

      expect(zodSchema.safeParse([1, 2, 3]).success).toBe(true);
      expect(zodSchema.safeParse([1, null, 3]).success).toBe(true);
      expect(zodSchema.safeParse([1, undefined, 3]).success).toBe(false);
    });
  });

  describe("Tuple Types", () => {
    test("should convert tuple schema", () => {
      const schema = Schema.Tuple(Schema.String, Schema.Number);
      const zodSchema = effectToZod(schema);

      expect(zodSchema.safeParse(["test", 123]).success).toBe(true);
      expect(zodSchema.safeParse([123, "test"]).success).toBe(false);
      expect(zodSchema.safeParse(["test"]).success).toBe(false);
    });

    test("should convert tuple with rest elements", () => {
      const schema = Schema.Tuple(Schema.String, Schema.Number);
      const zodSchema = effectToZod(schema);

      expect(zodSchema.safeParse(["test", 123]).success).toBe(true);
      expect(zodSchema.safeParse(["test"]).success).toBe(false);
      expect(zodSchema.safeParse(["test", "123"]).success).toBe(false);
    });
  });

  describe("Refinement Types", () => {
    test("should convert number refinement schema", () => {
      const schema = Schema.Number.pipe(Schema.nonNegative());
      const zodSchema = effectToZod(schema);

      expect(zodSchema.safeParse(123).success).toBe(true);
      expect(zodSchema.safeParse(-1).success).toBe(false);
      expect(zodSchema.safeParse("123").success).toBe(false);
    });

    test("should convert string refinement schema", () => {
      const minLength = (s: string) => s.length >= 3;
      const schema = Schema.String.pipe(Schema.filter(minLength));
      const zodSchema = effectToZod(schema);

      expect(zodSchema.safeParse("test").success).toBe(true);
      // String shorter than 3 characters should fail the filter
      expect(zodSchema.safeParse("ab").success).toBe(false);
      expect(zodSchema.safeParse(123).success).toBe(false);
    });

    test("should handle multiple refinements", () => {
      const schema = Schema.Number.pipe(
        Schema.nonNegative(),
        Schema.filter((n: number) => (n <= 100 ? true : false)),
      );
      const zodSchema = effectToZod(schema);

      expect(zodSchema.safeParse(50).success).toBe(true);
      expect(zodSchema.safeParse(-1).success).toBe(false);
      // Values over 100 should fail the second filter
      expect(zodSchema.safeParse(101).success).toBe(false);
    });
  });

  describe("Type Literals", () => {
    test("should convert simple object literals", () => {
      const schema = Schema.Struct({
        name: Schema.String,
        age: Schema.Number,
      });
      const zodSchema = effectToZod(schema);

      // Test valid data
      expect(zodSchema.safeParse({ name: "John", age: 30 }).success).toBe(true);
      // Test invalid types
      expect(zodSchema.safeParse({ name: 123, age: "30" }).success).toBe(false);
      // Test missing properties
      expect(zodSchema.safeParse({ name: "John" }).success).toBe(false);
    });

    test("should handle nested object literals", () => {
      const schema = Schema.Struct({
        user: Schema.Struct({
          info: Schema.Struct({
            name: Schema.String,
            email: Schema.String,
          }),
          settings: Schema.Struct({
            theme: Schema.Union(
              Schema.Literal("light"),
              Schema.Literal("dark"),
            ),
            notifications: Schema.Boolean,
          }),
        }),
      });
      const zodSchema = effectToZod(schema);

      // Test valid nested data
      expect(
        zodSchema.safeParse({
          user: {
            info: {
              name: "John",
              email: "john@example.com",
            },
            settings: {
              theme: "dark",
              notifications: true,
            },
          },
        }).success,
      ).toBe(true);

      // Test invalid nested data
      expect(
        zodSchema.safeParse({
          user: {
            info: {
              name: "John",
              // Missing email
            },
            settings: {
              theme: "invalid", // Invalid theme
              notifications: true,
            },
          },
        }).success,
      ).toBe(false);
    });

    test("should handle object literals with optional properties", () => {
      const schema = Schema.Struct({
        required: Schema.String,
        optional: Schema.UndefinedOr(Schema.Number),
      });
      const zodSchema = effectToZod(schema);

      // Test with optional field present
      expect(
        zodSchema.safeParse({ required: "test", optional: 42 }).success,
      ).toBe(true);

      // Test without optional field
      expect(zodSchema.safeParse({ required: "test" }).success).toBe(true);

      // Test missing required field
      expect(zodSchema.safeParse({ optional: 42 }).success).toBe(false);
    });

    test("should handle object literals with mixed types", () => {
      const schema = Schema.Struct({
        string: Schema.String,
        number: Schema.Number,
        boolean: Schema.Boolean,
        array: Schema.Array(Schema.String),
        union: Schema.Union(Schema.String, Schema.Number),
        literal: Schema.Literal("specific"),
      });
      const zodSchema = effectToZod(schema);

      // Test valid mixed types
      expect(
        zodSchema.safeParse({
          string: "test",
          number: 42,
          boolean: true,
          array: ["one", "two"],
          union: "text",
          literal: "specific",
        }).success,
      ).toBe(true);

      // Test valid union alternative
      expect(
        zodSchema.safeParse({
          string: "test",
          number: 42,
          boolean: true,
          array: ["one", "two"],
          union: 123, // Union allows number too
          literal: "specific",
        }).success,
      ).toBe(true);

      // Test invalid array element
      expect(
        zodSchema.safeParse({
          string: "test",
          number: 42,
          boolean: true,
          array: ["valid", 123], // Invalid array element
          union: "text",
          literal: "specific",
        }).success,
      ).toBe(false);

      // Test invalid literal value
      expect(
        zodSchema.safeParse({
          string: "test",
          number: 42,
          boolean: true,
          array: ["one", "two"],
          union: "text",
          literal: "wrong", // Invalid literal value
        }).success,
      ).toBe(false);
    });
  });
});

describe("effectToZodStruct", () => {
  test("should convert struct with BlockNoteDocument field", () => {
    const schema = Schema.Struct({ blocknote: BlockNoteDocument });
    const zodStruct = effectToZodStruct(schema);

    // Check that the result is an object with a blocknote property
    expect(zodStruct).toHaveProperty("blocknote");

    // Test with valid BlockNote document (array with at least one block)
    const validBlockNote = [
      {
        type: "paragraph",
        id: "block-1",
        props: {},
        content: [],
        children: [],
      },
    ];

    const validResult = zodStruct.blocknote.safeParse(validBlockNote);
    expect(validResult.success).toBe(true);

    // Test with invalid BlockNote document (empty array)
    // Effect filters are properly converted, so empty arrays should fail
    const invalidBlockNote: any[] = [];
    const invalidResult = zodStruct.blocknote.safeParse(invalidBlockNote);
    expect(invalidResult.success).toBe(false); // Empty arrays fail the filter requirement

    // Test with invalid BlockNote document (not an array)
    // Objects should fail validation as BlockNoteDocument expects an array
    const invalidBlockNote2 = { type: "paragraph" };
    const invalidResult2 = zodStruct.blocknote.safeParse(invalidBlockNote2);
    expect(invalidResult2.success).toBe(false); // Objects are not valid arrays
  });

  test("should convert struct with multiple fields including BlockNoteDocument", () => {
    const schema = Schema.Struct({
      title: Schema.String,
      blocknote: BlockNoteDocument,
      count: Schema.Number,
    });
    const zodStruct = effectToZodStruct(schema);

    // Check that all fields are present
    expect(zodStruct).toHaveProperty("title");
    expect(zodStruct).toHaveProperty("blocknote");
    expect(zodStruct).toHaveProperty("count");

    // Test with valid data
    const validBlockNote = [
      {
        type: "heading",
        id: "block-1",
        props: { level: 1 },
        content: [{ type: "text", text: "Hello" }],
        children: [],
      },
    ];

    expect(zodStruct.title.safeParse("Test Title").success).toBe(true);
    expect(zodStruct.blocknote.safeParse(validBlockNote).success).toBe(true);
    expect(zodStruct.count.safeParse(42).success).toBe(true);

    // Test with invalid data
    expect(zodStruct.title.safeParse(123).success).toBe(false);
    // Empty arrays fail validation due to the filter requirement
    expect(zodStruct.blocknote.safeParse([]).success).toBe(false);
    expect(zodStruct.count.safeParse("not a number").success).toBe(false);
  });

  describe("Annotations", () => {
    test("should convert schema with title annotation", () => {
      const schema = Schema.String.annotations({
        description: "User Name",
      });
      const zodSchema = effectToZod(schema);

      // Test that the schema still works for validation
      expect(zodSchema.safeParse("John Doe").success).toBe(true);
      expect(zodSchema.safeParse(123).success).toBe(false);

      // Test that description is applied (title is used as description in Zod)
      expect(zodSchema.description).toBe("User Name");
    });

    test("should convert schema with description annotation", () => {
      const schema = Schema.String.annotations({
        description: "Enter your full name",
      });
      const zodSchema = effectToZod(schema);

      // Test that the schema still works for validation
      expect(zodSchema.safeParse("John Doe").success).toBe(true);
      expect(zodSchema.safeParse(123).success).toBe(false);

      // Test that description is applied
      expect(zodSchema.description).toBe("Enter your full name");
    });

    test("should convert schema with both title and description annotations", () => {
      const schema = Schema.String.annotations({
        title: "User Name",
        description: "Enter your full name",
      });
      const zodSchema = effectToZod(schema);

      // Test that the schema still works for validation
      expect(zodSchema.safeParse("John Doe").success).toBe(true);
      expect(zodSchema.safeParse(123).success).toBe(false);

      // Test that description takes precedence over title
      expect(zodSchema.description).toBe("Enter your full name");
    });

    test("should convert schema without annotations", () => {
      const schema = Schema.String;
      const zodSchema = effectToZod(schema);

      // Test that the schema still works for validation
      expect(zodSchema.safeParse("John Doe").success).toBe(true);
      expect(zodSchema.safeParse(123).success).toBe(false);

      // Test that no description is applied
      expect(zodSchema._def.description).toBeUndefined();
    });

    test("should convert object schema with annotated properties", () => {
      const schema = Schema.Struct({
        name: Schema.String.annotations({
          title: "Full Name",
          description: "Enter your full name",
        }),
        age: Schema.Number.annotations({
          description: "Age in years",
        }),
        email: Schema.String.annotations({
          title: "Email Address",
          description: "Your primary email address",
        }),
      });

      const zodSchema = effectToZod(schema);
      const testData = { name: "John", age: 30, email: "john@example.com" };

      // Test that the schema works for validation
      const result = zodSchema.safeParse(testData);
      expect(result.success).toBe(true);

      // Test individual property descriptions
      const objectSchema = zodSchema as unknown as z.ZodObject<any>;
      expect(objectSchema.shape.name.description).toBe("Enter your full name");
      expect(objectSchema.shape.age.description).toBe("Age in years");
      expect(objectSchema.shape.email.description).toBe(
        "Your primary email address",
      );
    });

    test("should recursively apply annotations to deeply nested schemas", () => {
      const schema = Schema.Struct({
        user: Schema.Struct({
          name: Schema.String.annotations({
            title: "User Name",
            description: "The user's full name",
          }),
          profile: Schema.Struct({
            bio: Schema.String.annotations({
              title: "Biography",
              description: "User's personal biography",
            }),
            age: Schema.Number.annotations({
              title: "Age",
              description: "User's age in years",
            }),
          }).annotations({
            title: "User Profile",
            description: "Complete user profile information",
          }),
        }).annotations({
          title: "User",
          description: "User information object",
        }),
        settings: Schema.Struct({
          theme: Schema.String.annotations({
            title: "Theme",
            description: "UI theme preference",
          }),
        }).annotations({
          title: "Settings",
          description: "User preferences and settings",
        }),
      }).annotations({
        title: "Deep Schema",
        description: "A deeply nested schema with annotations at all levels",
      });

      const zodSchema = effectToZod(schema);
      const testData = {
        user: {
          name: "John Doe",
          profile: {
            bio: "Software developer",
            age: 30,
          },
        },
        settings: {
          theme: "dark",
        },
      };

      // Test that validation works
      const result = zodSchema.safeParse(testData);
      expect(result.success).toBe(true);

      // Test that annotations are applied at all levels
      const objectSchema = zodSchema as unknown as z.ZodObject<any>;

      // Root level
      expect(objectSchema.description).toBe(
        "A deeply nested schema with annotations at all levels",
      );

      // First level nested objects
      expect(objectSchema.shape.user.description).toBe(
        "User information object",
      );
      expect(objectSchema.shape.settings.description).toBe(
        "User preferences and settings",
      );

      // Second level nested properties
      expect(objectSchema.shape.user.shape.name.description).toBe(
        "The user's full name",
      );
      expect(objectSchema.shape.user.shape.profile.description).toBe(
        "Complete user profile information",
      );

      // Third level nested properties
      expect(objectSchema.shape.user.shape.profile.shape.bio.description).toBe(
        "User's personal biography",
      );
      expect(objectSchema.shape.user.shape.profile.shape.age.description).toBe(
        "User's age in years",
      );

      // Settings properties
      expect(objectSchema.shape.settings.shape.theme.description).toBe(
        "UI theme preference",
      );
    });
  });

  describe("Recursive/Declaration Types", () => {
    test("should handle recursive schemas with Declaration AST", () => {
      // Create a recursive schema using Schema.suspend (creates Declaration AST)
      const baseSchema = Schema.Struct({
        name: Schema.String,
      });

      type RecursiveType = Schema.Schema.Type<typeof baseSchema> & {
        readonly children?: ReadonlyArray<RecursiveType>;
      };

      const recursiveSchema: Schema.Schema<RecursiveType> = Schema.Struct({
        ...baseSchema.fields,
        children: Schema.optional(
          Schema.suspend(() => Schema.Array(recursiveSchema)),
        ),
      });

      const zodSchema = effectToZod(recursiveSchema);

      // Test valid recursive data
      const validData = {
        name: "root",
        children: [
          {
            name: "child1",
            children: [{ name: "grandchild1" }],
          },
          {
            name: "child2",
          },
        ],
      };

      expect(zodSchema.safeParse(validData).success).toBe(true);

      // Test data without children (should also work)
      const simpleData = { name: "simple" };
      expect(zodSchema.safeParse(simpleData).success).toBe(true);

      // Test invalid data (missing required name)
      const invalidData = { children: [{ name: "test" }] };
      expect(zodSchema.safeParse(invalidData).success).toBe(false);
    });
  });
});
