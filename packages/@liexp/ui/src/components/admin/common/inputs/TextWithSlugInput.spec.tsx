import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it } from "vitest";
import {
  SimpleForm,
  AdminContext,
  ResourceContextProvider,
  testDataProvider,
  TextInput,
} from "../../../admin/react-admin.js";
import { TextWithSlugInput } from "./TextWithSlugInput.js";

// Simple i18nProvider that just returns the field name
const testI18nProvider = {
  translate: (key: string) => {
    // Extract field name from "resources.posts.fields.fieldname"
    if (key.startsWith("resources.")) {
      const parts = key.split(".");
      return parts[parts.length - 1];
    }
    return key;
  },
  changeLocale: () => Promise.resolve(),
  getLocale: () => "en",
};

// Wrapper component that provides react-admin form context
const FormWrapper: React.FC<
  React.PropsWithChildren<{ defaultValues?: any }>
> = ({ children, defaultValues = {} }) => {
  return (
    <AdminContext
      dataProvider={testDataProvider()}
      i18nProvider={testI18nProvider}
    >
      <ResourceContextProvider value="posts">
        <SimpleForm defaultValues={defaultValues} onSubmit={() => {}}>
          {children}
        </SimpleForm>
      </ResourceContextProvider>
    </AdminContext>
  );
};

describe("TextWithSlugInput", () => {
  describe("when user types in source field", () => {
    it("should auto-generate kebab-case slug", async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper defaultValues={{ name: "", slug: "" }}>
          <TextWithSlugInput source="name" slugSource="slug" label="Name" />
        </FormWrapper>,
      );

      const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
      const slugInput = screen.getByLabelText("slug") as HTMLInputElement;

      await user.type(nameInput, "Hello World");

      await waitFor(() => {
        expect(slugInput.value).toBe("hello-world");
      });
    });

    it("should handle special characters correctly", async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper defaultValues={{ name: "", slug: "" }}>
          <TextWithSlugInput source="name" slugSource="slug" label="Name" />
        </FormWrapper>,
      );

      const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
      const slugInput = screen.getByLabelText("slug") as HTMLInputElement;

      await user.type(nameInput, "Foo & Bar!");

      await waitFor(() => {
        expect(slugInput.value).toBe("foo-bar");
      });
    });

    it("should handle spaces and multiple dashes", async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper defaultValues={{ name: "", slug: "" }}>
          <TextWithSlugInput source="name" slugSource="slug" label="Name" />
        </FormWrapper>,
      );

      const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
      const slugInput = screen.getByLabelText("slug") as HTMLInputElement;

      await user.type(nameInput, "Multi   Space   Test");

      await waitFor(() => {
        expect(slugInput.value).toBe("multi-space-test");
      });
    });
  });

  describe("when slug is manually edited", () => {
    it("should stop auto-generating slug", async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper defaultValues={{ name: "", slug: "" }}>
          <TextWithSlugInput source="name" slugSource="slug" label="Name" />
        </FormWrapper>,
      );

      const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
      const slugInput = screen.getByLabelText("slug") as HTMLInputElement;

      // First, auto-generate
      await user.type(nameInput, "Initial Name");
      await waitFor(() => {
        expect(slugInput.value).toBe("initial-name");
      });

      // Manually edit slug
      await user.clear(slugInput);
      await user.type(slugInput, "custom-slug");

      // Type more in name - slug should not change
      await user.type(nameInput, " More Text");
      await waitFor(() => {
        expect(slugInput.value).toBe("custom-slug");
      });
    });
  });

  describe("with existing record", () => {
    it("should display existing values", () => {
      render(
        <FormWrapper
          defaultValues={{ name: "Existing Name", slug: "existing-slug" }}
        >
          <TextWithSlugInput source="name" slugSource="slug" label="Name" />
        </FormWrapper>,
      );

      const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
      const slugInput = screen.getByLabelText("slug") as HTMLInputElement;

      expect(nameInput.value).toBe("Existing Name");
      expect(slugInput.value).toBe("existing-slug");
    });
  });

  describe("with custom slugSource", () => {
    it("should use custom slug field name", async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper defaultValues={{ fullName: "", username: "" }}>
          <TextWithSlugInput
            source="fullName"
            slugSource="username"
            label="Full Name"
          />
        </FormWrapper>,
      );

      const nameInput = screen.getByLabelText("Full Name") as HTMLInputElement;
      const usernameInput = screen.getByLabelText(
        "username",
      ) as HTMLInputElement;

      await user.type(nameInput, "John Doe");

      await waitFor(() => {
        expect(usernameInput.value).toBe("john-doe");
      });
    });
  });

  describe("integration with react-admin TextInput", () => {
    it("should work alongside other TextInput components", async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper defaultValues={{ name: "", slug: "", description: "" }}>
          <TextWithSlugInput source="name" slugSource="slug" label="Name" />
          <TextInput source="description" label="Description" />
        </FormWrapper>,
      );

      const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
      const slugInput = screen.getByLabelText("slug") as HTMLInputElement;
      const descInput = screen.getByLabelText(
        "Description",
      ) as HTMLInputElement;

      await user.type(nameInput, "Test Name");
      await user.type(descInput, "Test Description");

      await waitFor(() => {
        expect(nameInput.value).toBe("Test Name");
        expect(slugInput.value).toBe("test-name");
        expect(descInput.value).toBe("Test Description");
      });
    });
  });
});
