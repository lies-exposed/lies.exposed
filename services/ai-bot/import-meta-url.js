import path from 'path';
import { fileURLToPath } from 'url';

export const import_meta_url = fileURLToPath(`file://${path.resolve(process.cwd(), './build/run-esbuild.js')}`);
