// Re-export Express type augmentations from @liexp/backend
// This ensures consistent type definitions across all services
// @ts-expect-error - Typings are resolved at compile time through tsconfig includes
import "@liexp/backend/typings/express";

export {};
