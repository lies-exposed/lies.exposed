import { defineWorkspace } from 'vitest/config';

const workspaces = defineWorkspace([
  'services/api/vitest-e2e.config.ts',
])

export default workspaces