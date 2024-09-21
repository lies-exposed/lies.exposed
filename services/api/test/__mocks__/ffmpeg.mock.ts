import Ffmpeg from 'fluent-ffmpeg';
import { MockProxy } from 'vitest-mock-extended';



export const ffmpegCommandMock = {
  _screenshots: {
    folder: '',
    filename: '',
    count: 0,
  },
  on: vi.fn((event: string, cb: Function): void => {
    throw new Error('on not implemented');
  }),
  inputFormat: vi.fn().mockReturnThis(),
  noAudio: vi.fn().mockReturnThis(),
  screenshots: vi.fn().mockImplementation(function(this: any, opts) {
    this._screenshots = opts;
    return this;
  }),
}

const ffmpegMock: MockProxy< typeof Ffmpeg> = vi.fn(() => ffmpegCommandMock) as any
(ffmpegMock as any).ffprobe = vi.fn(() => {
  throw new Error('ffprobe not implemented');
})

export default ffmpegMock;

