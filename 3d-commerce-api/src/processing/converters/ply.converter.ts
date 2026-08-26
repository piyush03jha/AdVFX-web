import { ModelConverter } from './model-converter';

export class PlyConverter implements ModelConverter {
  readonly format = 'PLY';

  async convert(_inputKey: string, _outputKey: string): Promise<void> {
    throw new Error('PLY conversion is not configured yet.');
  }
}
