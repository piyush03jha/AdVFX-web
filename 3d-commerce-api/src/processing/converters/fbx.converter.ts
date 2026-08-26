import { ModelConverter } from './model-converter';

export class FbxConverter implements ModelConverter {
  readonly format = 'FBX';

  async convert(_inputKey: string, _outputKey: string): Promise<void> {
    throw new Error('FBX conversion is not configured yet.');
  }
}
