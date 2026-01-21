import { ErrorBox } from "@liexp/ui/lib/components/Common/ErrorBox.js";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import "react";

const meta: Meta<typeof ErrorBox> = {
  title: "Components/Common/ErrorBox",
  component: ErrorBox,
  parameters: {
    docs: {
      description: {
        component:
          "ErrorBox component displays error information with optional reset functionality. Supports APIError and CoreError types.",
      },
    },
  },
  argTypes: {
    enableReset: {
      control: "boolean",
      description: "Show reset button",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ErrorBox>;

// Mock resetErrorBoundary function
const mockReset = () => {
  // eslint-disable-next-line no-console
  console.log("Reset error boundary triggered");
};

/**
 * Client Error (4xx) - Represents errors from client-side issues
 * such as bad requests, unauthorized access, or not found errors.
 */
export const ClientError: Story = {
  args: {
    error: {
      name: "APIError",
      message: "The requested resource was not found",
      status: 404,
      details: [
        "Resource ID: abc-123 does not exist",
        "Please check the URL and try again",
      ],
    },
    resetErrorBoundary: mockReset,
    enableReset: true,
  },
};

/**
 * Server Error (5xx) - Represents server-side errors
 * such as internal server errors or service unavailability.
 */
export const ServerError: Story = {
  args: {
    error: {
      name: "APIError",
      message: "Internal server error occurred",
      status: 500,
      details: [
        "Database connection failed",
        "Error: ECONNREFUSED at PostgreSQL:5432",
        "Please try again later or contact support",
      ],
    },
    resetErrorBoundary: mockReset,
    enableReset: true,
  },
};

/**
 * Decoding Error - Represents schema validation/decoding errors
 * when the response doesn't match the expected schema.
 */
export const DecodingError: Story = {
  args: {
    error: {
      name: "APIError",
      message: "Failed to decode response",
      status: 400,
      details: [
        'Expected string at path "user.email", received undefined',
        'Expected number at path "user.age", received "twenty-five"',
        'Missing required field: "user.name"',
      ],
    },
    resetErrorBoundary: mockReset,
    enableReset: true,
  },
};

/**
 * Unauthorized Error (401) - Authentication required
 */
export const UnauthorizedError: Story = {
  args: {
    error: {
      name: "APIError",
      message: "Authentication required",
      status: 401,
      details: ["Please log in to access this resource"],
    },
    resetErrorBoundary: mockReset,
    enableReset: true,
  },
};

/**
 * CoreError - Generic error without HTTP status
 */
export const CoreError: Story = {
  args: {
    error: {
      name: "ValidationError",
      message: "Form validation failed",
      details: [
        "Email format is invalid",
        "Password must be at least 8 characters",
      ],
    },
    resetErrorBoundary: mockReset,
    enableReset: false,
  },
};

/**
 * Error without details - Minimal error display
 */
export const ErrorWithoutDetails: Story = {
  args: {
    error: {
      name: "APIError",
      message: "Something went wrong",
      status: 500,
      details: undefined,
    },
    resetErrorBoundary: mockReset,
    enableReset: false,
  },
};

/**
 * Error without reset button
 */
export const ErrorWithoutReset: Story = {
  args: {
    error: {
      name: "APIError",
      message: "Network connection lost",
      status: 500,
      details: ["Unable to reach the server", "Check your internet connection"],
    },
    resetErrorBoundary: mockReset,
    enableReset: false,
  },
};

/**
 * Error with custom styling
 */
export const ErrorWithCustomStyle: Story = {
  args: {
    error: {
      name: "APIError",
      message: "Rate limit exceeded",
      status: 400,
      details: [
        "Too many requests",
        "Please wait 60 seconds before trying again",
      ],
    },
    resetErrorBoundary: mockReset,
    enableReset: true,
    style: {
      maxWidth: 400,
      margin: "0 auto",
      border: "2px solid #f44336",
    },
  },
};

/**
 * JavaScript Error - Raw Error object handling
 */
export const JavaScriptError: Story = {
  args: {
    error: new TypeError("Cannot read property 'map' of undefined"),
    resetErrorBoundary: mockReset,
    enableReset: true,
  },
};
