import { FSClient } from '@liexp/backend/lib/providers/fs/fs.provider.js';
import { mock } from 'vitest-mock-extended';

export const queueFSMock = mock<FSClient>();